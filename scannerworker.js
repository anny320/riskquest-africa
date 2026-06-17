const ALLOWED_ORIGIN = 'https://anny320.github.io';

const SECURITY_HEADERS = [
  { key: 'content-security-policy', label: 'Content-Security-Policy', weight: 10 },
  { key: 'strict-transport-security', label: 'Strict-Transport-Security (HSTS)', weight: 10 },
  { key: 'x-frame-options', label: 'X-Frame-Options', weight: 8 },
  { key: 'x-content-type-options', label: 'X-Content-Type-Options', weight: 5 },
  { key: 'referrer-policy', label: 'Referrer-Policy', weight: 4 },
  { key: 'permissions-policy', label: 'Permissions-Policy', weight: 3 }
];

const EXPOSED_PATHS = [
  '/.git/config',
  '/.env',
  '/wp-config.php.bak',
  '/backup.zip',
  '/phpinfo.php',
  '/.DS_Store'
];

const VULNERABLE_LIBRARIES = [
  { pattern: /jquery[.-](1\.[0-9]|2\.[0-9]|3\.[0-4])\.[0-9]+/i, label: 'jQuery (outdated, known XSS issues)' },
  { pattern: /bootstrap[.-](2\.|3\.|4\.[0-2])/i, label: 'Bootstrap (outdated, known XSS issues)' },
  { pattern: /angular(?:js)?[.-]1\.[0-5]\./i, label: 'AngularJS 1.x (end of life, multiple CVEs)' }
];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}

function normalizeUrl(input) {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    return url;
  } catch (err) {
    return null;
  }
}

async function checkHttpsEnforcement(targetUrl) {
  const httpUrl = `http://${targetUrl.host}${targetUrl.pathname}`;
  try {
    const res = await fetch(httpUrl, { redirect: 'manual' });
    const redirectedToHttps = [301, 302, 307, 308].includes(res.status) &&
      (res.headers.get('location') || '').startsWith('https://');
    return {
      category: 'Transport & Identity',
      label: 'HTTPS Enforcement',
      status: redirectedToHttps ? 'pass' : 'fail',
      detail: redirectedToHttps
        ? 'HTTP requests are redirected to HTTPS.'
        : 'Site does not redirect HTTP to HTTPS, allowing insecure connections.'
    };
  } catch (err) {
    return {
      category: 'Transport & Identity',
      label: 'HTTPS Enforcement',
      status: 'unknown',
      detail: 'Could not verify HTTP-to-HTTPS redirect behavior.'
    };
  }
}

async function checkSecurityHeaders(response) {
  return SECURITY_HEADERS.map(({ key, label }) => {
    const present = response.headers.has(key);
    return {
      category: 'Security Headers',
      label,
      status: present ? 'pass' : 'fail',
      detail: present ? `${label} header is set.` : `${label} header is missing.`
    };
  });
}

async function checkExposedFiles(targetUrl) {
  const results = [];
  for (const path of EXPOSED_PATHS) {
    try {
      const res = await fetch(`${targetUrl.origin}${path}`, { method: 'GET', redirect: 'manual' });
      const exposed = res.status === 200;
      results.push({
        category: 'Exposed Sensitive Files',
        label: path,
        status: exposed ? 'fail' : 'pass',
        detail: exposed
          ? `${path} is publicly accessible (HTTP ${res.status}).`
          : `${path} is not publicly accessible.`
      });
    } catch (err) {
      results.push({
        category: 'Exposed Sensitive Files',
        label: path,
        status: 'unknown',
        detail: `Could not check ${path}.`
      });
    }
  }
  return results;
}

async function checkDnsRecords(targetUrl) {
  const domain = targetUrl.hostname.replace(/^www\./, '');
  const results = [];

  async function dohQuery(name, type) {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.Answer || null;
  }

  try {
    const spf = await dohQuery(domain, 'TXT');
    const hasSpf = (spf || []).some((r) => (r.data || '').includes('v=spf1'));
    results.push({
      category: 'Email Spoofing Risk',
      label: 'SPF Record',
      status: hasSpf ? 'pass' : 'fail',
      detail: hasSpf ? 'SPF record found.' : 'No SPF record found — domain is vulnerable to email spoofing.'
    });
  } catch (err) {
    results.push({ category: 'Email Spoofing Risk', label: 'SPF Record', status: 'unknown', detail: 'Could not check SPF record.' });
  }

  try {
    const dmarc = await dohQuery(`_dmarc.${domain}`, 'TXT');
    const hasDmarc = (dmarc || []).some((r) => (r.data || '').includes('v=DMARC1'));
    results.push({
      category: 'Email Spoofing Risk',
      label: 'DMARC Record',
      status: hasDmarc ? 'pass' : 'fail',
      detail: hasDmarc ? 'DMARC record found.' : 'No DMARC record found — increases risk of fake invoice/CEO-fraud emails impersonating this domain.'
    });
  } catch (err) {
    results.push({ category: 'Email Spoofing Risk', label: 'DMARC Record', status: 'unknown', detail: 'Could not check DMARC record.' });
  }

  return results;
}

function checkOutdatedLibraries(html) {
  const findings = [];
  for (const lib of VULNERABLE_LIBRARIES) {
    if (lib.pattern.test(html)) {
      findings.push({
        category: 'Outdated Software',
        label: lib.label,
        status: 'fail',
        detail: `Detected reference to ${lib.label} in page source.`
      });
    }
  }
  if (findings.length === 0) {
    findings.push({
      category: 'Outdated Software',
      label: 'Known vulnerable libraries',
      status: 'pass',
      detail: 'No commonly known vulnerable library versions detected in page source.'
    });
  }
  return findings;
}

function computeScore(findings) {
  const weighted = findings.filter((f) => f.status !== 'unknown');
  const total = weighted.length || 1;
  const passed = weighted.filter((f) => f.status === 'pass').length;
  const score = Math.round((passed / total) * 100);
  const riskLevel = score >= 80 ? 'Low' : score >= 50 ? 'Medium' : 'High';
  return { score, riskLevel };
}

async function runScan(rawUrl) {
  const targetUrl = normalizeUrl(rawUrl);
  if (!targetUrl) {
    throw new Error('Invalid URL');
  }

  const response = await fetch(targetUrl.toString(), { redirect: 'follow' });
  const html = await response.text();

  const findings = [
    ...(await checkSecurityHeaders(response)),
    await checkHttpsEnforcement(targetUrl),
    ...(await checkExposedFiles(targetUrl)),
    ...(await checkDnsRecords(targetUrl)),
    ...checkOutdatedLibraries(html)
  ];

  const { score, riskLevel } = computeScore(findings);

  return {
    url: targetUrl.toString(),
    scannedAt: new Date().toISOString(),
    score,
    riskLevel,
    findings
  };
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Use POST with { "url": "https://example.com" }' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.url) {
      return jsonResponse({ error: 'Missing "url" in request body' }, 400);
    }

    try {
      const report = await runScan(body.url);
      return jsonResponse(report);
    } catch (err) {
      return jsonResponse({ error: err.message || 'Scan failed' }, 500);
    }
  }
};
