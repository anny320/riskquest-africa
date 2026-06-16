const CATEGORY_META = {
  cybersecurity: {
    label: 'Cybersecurity',
    finding: (score) => score >= 80
      ? 'Core security controls (authentication, access control, endpoint security, incident response) are well established.'
      : score >= 50
        ? 'Some security controls are in place, but gaps remain in areas such as access control, endpoint protection, or incident response.'
        : 'Fundamental security controls are weak or missing, leaving the organization exposed to common attack patterns such as phishing and fraud.',
    recommendation: (score) => score >= 80
      ? 'Maintain current controls and conduct periodic awareness refreshers.'
      : score >= 50
        ? 'Formalize incident response procedures and reinforce security awareness training.'
        : 'Prioritize a baseline security review: enforce MFA, endpoint encryption, and a documented incident response plan.'
  },
  dataProtection: {
    label: 'Data Protection',
    finding: (score) => score >= 80
      ? 'Data handling, backup, and privacy practices meet good SME practice.'
      : score >= 50
        ? 'Backup and data handling practices exist but are inconsistently applied.'
        : 'Data protection controls are largely absent, creating high exposure to data loss or leakage.',
    recommendation: (score) => score >= 80
      ? 'Continue periodic backup testing and privacy control reviews.'
      : score >= 50
        ? 'Standardize backup schedules and document data handling procedures.'
        : 'Implement encrypted, tested backups and a written data handling policy as a priority.'
  },
  aiGovernance: {
    label: 'AI Governance',
    finding: (score) => score >= 80
      ? 'AI usage is governed by clear, enforced policies limiting data exposure.'
      : score >= 50
        ? 'AI usage policy exists but enforcement or staff awareness is inconsistent.'
        : 'No effective AI governance is in place; staff may expose confidential data through public AI tools.',
    recommendation: (score) => score >= 80
      ? 'Review AI policy annually as new tools are adopted.'
      : score >= 50
        ? 'Communicate and enforce the AI usage policy across all departments.'
        : 'Draft and roll out a written AI usage policy restricting confidential data input into public AI tools.'
  },
  businessContinuity: {
    label: 'Business Continuity',
    finding: (score) => score >= 80
      ? 'Disaster recovery and backup readiness support fast recovery from outages.'
      : score >= 50
        ? 'Some continuity planning exists, but recovery processes are not fully tested.'
        : 'Business continuity and disaster recovery planning is weak, risking extended downtime after an incident.',
    recommendation: (score) => score >= 80
      ? 'Continue periodic disaster recovery testing.'
      : score >= 50
        ? 'Test backup restoration procedures and document a recovery runbook.'
        : 'Establish and test a disaster recovery plan, including offsite/cloud backups, immediately.'
  }
};

function riskRatingFor(score) {
  if (score >= 80) return { label: 'Low', color: [16, 185, 129] };
  if (score >= 50) return { label: 'Medium', color: [249, 115, 22] };
  return { label: 'High', color: [239, 68, 68] };
}

function addSectionHeading(doc, title, x, y) {
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, x, y);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.line(x, y + 8, x + 40, y + 8);
  doc.setFont(undefined, 'normal');
}

function generatePDFReport(lead, results, badges, radarChartCanvasId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // ---------- Page 1: Cover ----------
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 220, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text('WAKARA TECHNOLOGIES LIMITED', margin, 60);
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.text('Secure360 Assessment Report', margin, 100);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text('CONFIDENTIAL — Prepared exclusively for the named recipient', margin, 125);

  doc.setFontSize(12);
  doc.text(`Company: ${lead.company}`, margin, 160);
  doc.text(`Prepared for: ${lead.name}`, margin, 180);
  doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, margin, 200);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.text('Overall Score', margin, 270);
  doc.setFontSize(36);
  doc.setFont(undefined, 'bold');
  doc.text(`${results.overall}/100`, margin, 305);
  doc.setFont(undefined, 'normal');

  const risk = results.riskLevel;
  doc.setFillColor(...hexToRgb(risk.color));
  doc.roundedRect(margin, 320, 160, 28, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(risk.label, margin + 16, 338);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize('This report was generated using the Wakara Secure360 Challenge — a gamified self-assessment simulation mapped to cybersecurity, data protection, AI governance, and business continuity controls.', contentWidth),
    margin, 400
  );

  // ---------- Page 2: Scope, Methodology & Risk Rating Definitions ----------
  doc.addPage();
  addSectionHeading(doc, 'Scope & Methodology', margin, 70);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(
    `This assessment was conducted using the Wakara Secure360 Challenge, an interactive simulation in which ${lead.company} navigated realistic business risk scenarios covering payment fraud, endpoint security, AI tool usage, business continuity, and social engineering. Each decision was mapped to underlying controls across five pillars: People, Process, Technology, Data, and AI Governance.`,
    contentWidth
  ), margin, 100);

  addSectionHeading(doc, 'Risk Rating Definitions', margin, 220);
  const ratingRows = [
    ['Rating', 'Score Range', 'Description'],
    ['High Risk', '0 – 49', 'Significant control gaps. Immediate remediation recommended.'],
    ['Medium Risk', '50 – 79', 'Partial controls in place. Targeted improvements recommended.'],
    ['Low Risk', '80 – 100', 'Strong control posture. Maintain and monitor.']
  ];
  drawTable(doc, ratingRows, margin, 250, [100, 90, contentWidth - 190], [
    null,
    null,
    null
  ]);

  // ---------- Page 3: Executive Summary ----------
  doc.addPage();
  addSectionHeading(doc, 'Executive Summary', margin, 70);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  const summary = `${lead.company} achieved an overall Secure360 score of ${results.overall}/100, placing it in the "${results.riskLevel.label}" category. The sections below summarize key strengths and risk areas identified during the simulation, followed by a prioritized action plan.`;
  doc.text(doc.splitTextToSize(summary, contentWidth), margin, 100);

  const strengthsAndRisks = buildStrengthsAndRisks(results);
  let y = 160;
  doc.setFont(undefined, 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Top Strengths', margin, y);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);
  y += 20;
  strengthsAndRisks.strengths.forEach((s) => {
    doc.text(`• ${s}`, margin, y);
    y += 18;
  });

  y += 20;
  doc.setFont(undefined, 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('Top Risks', margin, y);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(51, 65, 85);
  y += 20;
  strengthsAndRisks.risks.forEach((r) => {
    doc.text(`• ${r}`, margin, y);
    y += 18;
  });

  // ---------- Page 4: Detailed Findings ----------
  doc.addPage();
  addSectionHeading(doc, 'Detailed Findings', margin, 70);
  y = 100;
  Object.entries(CATEGORY_META).forEach(([key, meta]) => {
    const score = results.categories[key];
    const rating = riskRatingFor(score);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 110, 6, 6, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(meta.label, margin + 14, y + 24);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Score: ${score}/100`, margin + 14, y + 42);

    doc.setFillColor(...rating.color);
    doc.roundedRect(margin + contentWidth - 110, y + 14, 96, 22, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`${rating.label} Risk`, margin + contentWidth - 100, y + 29);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(`Finding: ${meta.finding(score)}`, contentWidth - 28), margin + 14, y + 60);
    doc.text(doc.splitTextToSize(`Recommendation: ${meta.recommendation(score)}`, contentWidth - 28), margin + 14, y + 88);

    y += 122;
  });

  // ---------- Page 5: Radar Chart ----------
  const canvas = document.getElementById(radarChartCanvasId);
  if (canvas) {
    const imgData = canvas.toDataURL('image/png');
    doc.addPage();
    addSectionHeading(doc, 'Risk Profile Radar', margin, 70);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('People · Process · Technology · Data · AI Governance', margin, 95);
    doc.addImage(imgData, 'PNG', margin, 115, 400, 400);
  }

  // ---------- Page 6: Recommendations Roadmap ----------
  doc.addPage();
  addSectionHeading(doc, 'Recommendations Roadmap', margin, 70);

  const roadmap = [
    ['Immediate Actions', [
      'Verify high-risk payment requests through a second channel',
      'Enable device encryption and remote wipe on all company laptops',
      'Establish a written AI usage policy'
    ]],
    ['30-Day Plan', [
      'Roll out security awareness training',
      'Implement and test regular backups',
      'Document an incident response process'
    ]],
    ['90-Day Plan', [
      'Formalize access control and least-privilege policies',
      'Conduct a full business continuity and disaster recovery test',
      'Review AI governance and data sharing agreements'
    ]]
  ];

  y = 105;
  roadmap.forEach(([title, items]) => {
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(title, margin, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    y += 20;
    items.forEach((item) => {
      doc.text(doc.splitTextToSize(`• ${item}`, contentWidth), margin, y);
      y += 20;
    });
    y += 18;
  });

  // ---------- Page 7: Consultation Options ----------
  doc.addPage();
  addSectionHeading(doc, 'Consultation Options', margin, 70);

  const offers = [
    ['Starter Security Review — KES 20,000', '60-minute consultation, report review, priority actions'],
    ['SME Security Roadmap — KES 60,000', 'Assessment review, security roadmap, templates, follow-up support'],
    ['Digital Resilience Programme — Custom Pricing', 'Cybersecurity, AI Governance, Data Protection, Staff Training, Governance Frameworks']
  ];

  y = 105;
  offers.forEach(([title, desc]) => {
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    y += 18;
    doc.text(doc.splitTextToSize(desc, contentWidth), margin, y);
    y += 45;
  });

  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('Talk to an Expert: wa.me/254117784724', margin, y);
  y += 18;
  doc.text('Email: wakaratech@gmail.com', margin, y);

  stampFooters(doc, margin, pageWidth, pageHeight);
  doc.save(`Secure360-Report-${lead.company.replace(/\s+/g, '-')}.pdf`);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function buildStrengthsAndRisks(results) {
  const entries = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    label: meta.label,
    score: results.categories[key]
  }));
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 2).map((e) => `${e.label} (${e.score}/100)`);
  const risks = sorted.slice(-2).reverse().map((e) => `${e.label} (${e.score}/100)`);
  return { strengths, risks };
}

function drawTable(doc, rows, x, y, colWidths, rowColors) {
  const rowHeight = 26;
  let currentY = y;
  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    doc.setFillColor(isHeader ? 37 : 248, isHeader ? 99 : 250, isHeader ? 235 : 252);
    doc.rect(x, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    doc.setTextColor(isHeader ? 255 : 51, isHeader ? 255 : 65, isHeader ? 255 : 85);
    doc.setFont(undefined, isHeader ? 'bold' : 'normal');
    doc.setFontSize(10);

    let currentX = x;
    row.forEach((cell, colIndex) => {
      doc.text(String(cell), currentX + 8, currentY + 17);
      currentX += colWidths[colIndex];
    });
    currentY += rowHeight;
  });
  doc.setFont(undefined, 'normal');
}

function stampFooters(doc, margin, pageWidth, pageHeight) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont(undefined, 'normal');
    doc.text('Wakara Secure360 Assessment Report — CONFIDENTIAL', margin, pageHeight - 25);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 60, pageHeight - 25);
  }
}

window.PDFReport = { generatePDFReport };
