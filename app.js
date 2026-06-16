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

function whatsappLink(message) {
  const phone = '254700000000';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

window.App = { saveSession, loadSession, clearSession, whatsappLink };
