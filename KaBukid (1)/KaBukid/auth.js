(() => {
  'use strict';
  const key = 'kabukid-demo-session';
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
  const form = document.querySelector('#authForm');
  if (form) {
    document.querySelector('#showPassword').addEventListener('click', e => {
      const input = document.querySelector('#password');
      input.type = input.type === 'password' ? 'text' : 'password';
      e.target.textContent = input.type === 'password' ? 'Show' : 'Hide';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const role = document.querySelector('#accountRole').value;
      const identity = document.querySelector('#identity').value.trim();
      const name = document.querySelector('#fullName')?.value.trim() || identity || (role === 'farmer' ? 'Demo Farmer' : 'Demo Buyer');
      const profile = { name, role };
      window.KaBukidSession = profile;
      try { sessionStorage.setItem(key, JSON.stringify(profile)); } catch (_) {
        // Carry the non-sensitive demo profile if browser storage is unavailable.
        window.name = 'kabukid-demo:' + JSON.stringify(profile);
      }
      location.href = 'index.html';
    });
    return;
  }
  if (!session && window.name.startsWith('kabukid-demo:')) {
    try { session = JSON.parse(window.name.slice(13)); } catch (_) {}
  }
  if (!session || typeof session.name !== 'string' || !['buyer', 'farmer'].includes(session.role)) {
    location.replace('login.html');
    return;
  }
  window.KaBukidSession = session;
  document.querySelector('#accountLabel').textContent = session.name + ' · ' + session.role;
  document.querySelector('#logoutBtn').addEventListener('click', () => {
    try { sessionStorage.removeItem(key); } catch (_) {}
    window.name = '';
    location.href = 'login.html';
  });
})();
