function generatePDFReport(lead, results, badges, radarChartCanvasId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 200, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WAKARA TECHNOLOGIES LIMITED', margin, 60);
  doc.setFontSize(26);
  doc.text('Secure360 Assessment Report', margin, 95);
  doc.setFontSize(12);
  doc.text(`Company: ${lead.company}`, margin, 135);
  doc.text(`Prepared for: ${lead.name}`, margin, 155);
  doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, margin, 175);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text(`Overall Score: ${results.overall}/100`, margin, 240);
  doc.setFontSize(16);
  doc.setTextColor(results.riskLevel.color);
  doc.text(`Risk Rating: ${results.riskLevel.label}`, margin, 265);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text('Executive Summary', margin, 305);
  doc.setFontSize(11);
  const summary = `${lead.company} achieved an overall Secure360 score of ${results.overall}/100, placing it in the "${results.riskLevel.label}" category. This report outlines key strengths, risk areas, and a prioritized action plan to strengthen cybersecurity, data protection, AI governance, and business continuity.`;
  doc.text(doc.splitTextToSize(summary, pageWidth - margin * 2), margin, 325);

  doc.setFontSize(16);
  doc.text('Detailed Results', margin, 400);
  doc.setFontSize(11);
  let y = 425;
  const detailRows = [
    ['Cybersecurity', results.categories.cybersecurity],
    ['Data Protection', results.categories.dataProtection],
    ['AI Governance', results.categories.aiGovernance],
    ['Business Continuity', results.categories.businessContinuity]
  ];
  detailRows.forEach(([label, score]) => {
    doc.text(`${label}: ${score}/100`, margin, y);
    y += 20;
  });

  const canvas = document.getElementById(radarChartCanvasId);
  if (canvas) {
    const imgData = canvas.toDataURL('image/png');
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Radar Chart: People, Process, Technology, Data, AI Governance', margin, 60);
    doc.addImage(imgData, 'PNG', margin, 80, 400, 400);
  }

  doc.addPage();
  doc.setFontSize(18);
  doc.text('Recommendations', margin, 60);
  doc.setFontSize(13);
  doc.text('Immediate Actions', margin, 95);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize('- Verify high-risk payment requests through a second channel\n- Enable device encryption and remote wipe on all company laptops\n- Establish a written AI usage policy', pageWidth - margin * 2), margin, 115);

  doc.setFontSize(13);
  doc.text('30-Day Plan', margin, 200);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize('- Roll out security awareness training\n- Implement and test regular backups\n- Document an incident response process', pageWidth - margin * 2), margin, 220);

  doc.setFontSize(13);
  doc.text('90-Day Plan', margin, 290);
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize('- Formalize access control and least-privilege policies\n- Conduct a full business continuity and disaster recovery test\n- Review AI governance and data sharing agreements', pageWidth - margin * 2), margin, 310);

  doc.addPage();
  doc.setFontSize(18);
  doc.text('Consultation Options', margin, 60);
  doc.setFontSize(13);
  doc.text('Starter Security Review — KES 15,000', margin, 100);
  doc.setFontSize(11);
  doc.text('60-minute consultation, report review, priority actions', margin, 118);

  doc.setFontSize(13);
  doc.text('SME Security Roadmap — KES 50,000', margin, 155);
  doc.setFontSize(11);
  doc.text('Assessment review, security roadmap, templates, follow-up support', margin, 173);

  doc.setFontSize(13);
  doc.text('Digital Resilience Programme — Custom Pricing', margin, 210);
  doc.setFontSize(11);
  doc.text('Cybersecurity, AI Governance, Data Protection, Staff Training, Governance Frameworks', margin, 228);

  doc.save(`Secure360-Report-${lead.company.replace(/\s+/g, '-')}.pdf`);
}

window.PDFReport = { generatePDFReport };
