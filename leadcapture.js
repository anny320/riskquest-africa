function saveLead(lead) {
  localStorage.setItem('secure360_lead', JSON.stringify(lead));
}

function getLead() {
  const raw = localStorage.getItem('secure360_lead');
  return raw ? JSON.parse(raw) : null;
}

function validateLead(lead) {
  const errors = {};
  if (!lead.name || !lead.name.trim()) errors.name = 'Name is required';
  if (!lead.company || !lead.company.trim()) errors.company = 'Company name is required';
  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.email = 'A valid email is required';
  if (!lead.phone || !lead.phone.trim()) errors.phone = 'Phone number is required';
  return errors;
}

window.LeadCapture = { saveLead, getLead, validateLead };
