const STORAGE_KEY = 'secure360_session';

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

const WAKARA_PHONE = '254117784724';
const WAKARA_EMAIL = 'wakaratech@gmail.com';

function whatsappLink(message) {
  return `https://wa.me/${WAKARA_PHONE}?text=${encodeURIComponent(message)}`;
}

function mailtoLink(subject, body) {
  return `mailto:${WAKARA_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

window.App = { saveSession, loadSession, clearSession, whatsappLink, mailtoLink, WAKARA_PHONE, WAKARA_EMAIL };
