/**
 * admin/js/api.js — Centralized API client for Admin Panel
 * Reads backend URL from ../../config.js
 */

const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.BACKEND_URL)
  ? CONFIG.BACKEND_URL
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:8080'
    : (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:8080');

const Api = {
  // ── Token Management ────────────────────────────────────────────────────
  getToken()   { return localStorage.getItem('admin_token'); },
  setToken(t)  { localStorage.setItem('admin_token', t); },
  clearToken() { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); },
  isLoggedIn() { return !!this.getToken(); },

  // ── Request Headers ──────────────────────────────────────────────────────
  headers(extra = {}) {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...extra,
    };
  },

  // ── Core Fetch ───────────────────────────────────────────────────────────
  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 401) {
      this.clearToken();
      if (!window.location.href.includes('login')) window.location.href = '../index.html';
      throw new Error('Unauthorized');
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  },

  get(path)         { return this.request('GET',    path); },
  post(path, body)  { return this.request('POST',   path, body); },
  put(path, body)   { return this.request('PUT',    path, body); },
  delete(path)      { return this.request('DELETE', path); },

  // ── Auth ─────────────────────────────────────────────────────────────────
  async login(username, password) {
    const data = await this.post('/api/auth/login', { username, password });
    this.setToken(data.token);
    localStorage.setItem('admin_user', JSON.stringify({ username: data.username, role: data.role }));
    return data;
  },
  logout() { this.clearToken(); window.location.href = '../index.html'; },

  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboardStats()   { return this.get('/api/admin/dashboard/stats'); },

  // ── Visitors ─────────────────────────────────────────────────────────────
  getVisitorAnalytics() { return this.get('/api/admin/visitors'); },

  // ── Contacts ─────────────────────────────────────────────────────────────
  getContacts(q = '', isRead = null, page = 0, size = 20) {
    let url = `/api/admin/contacts?page=${page}&size=${size}`;
    if (q)       url += `&q=${encodeURIComponent(q)}`;
    if (isRead !== null) url += `&isRead=${isRead}`;
    return this.get(url);
  },
  markContactRead(id, value) { return this.put(`/api/admin/contacts/${id}/read?value=${value}`); },
  deleteContact(id)           { return this.delete(`/api/admin/contacts/${id}`); },

  // ── Projects ─────────────────────────────────────────────────────────────
  getAdminProjects()         { return this.get('/api/admin/projects'); },
  createProject(data)        { return this.post('/api/admin/projects', data); },
  updateProject(id, data)    { return this.put(`/api/admin/projects/${id}`, data); },
  deleteProject(id)          { return this.delete(`/api/admin/projects/${id}`); },

  // ── Skills ───────────────────────────────────────────────────────────────
  getAdminSkills()           { return this.get('/api/admin/skills'); },
  createSkill(data)          { return this.post('/api/admin/skills', data); },
  updateSkill(id, data)      { return this.put(`/api/admin/skills/${id}`, data); },
  deleteSkill(id)            { return this.delete(`/api/admin/skills/${id}`); },

  // ── Resume ───────────────────────────────────────────────────────────────
  trackResumeDownload() {
    return fetch(`${API_BASE}/api/resume/download`, { method: 'POST' });
  },
};

// ── Toast System ────────────────────────────────────────────────────────────
const Toast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error');   },
  info(msg)    { this.show(msg, 'info');    },
};

// ── Auth Guard ───────────────────────────────────────────────────────────────
function requireAuth() {
  if (!Api.isLoggedIn()) { window.location.href = '../index.html?login=1'; return false; }
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const el = document.getElementById('sidebarUsername');
  if (el) el.textContent = user.username || 'Admin';
  return true;
}

// ── Sidebar Init ──────────────────────────────────────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar   = document.getElementById('sidebar');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !hamburger.contains(e.target))
        sidebar.classList.remove('open');
    });
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    if (confirm('Logout from admin panel?')) Api.logout();
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function hideLoader() {
  const el = document.getElementById('pageLoader');
  if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 500); }
}
function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n || 0);
}
function animateCount(el, target, duration = 1200) {
  if (!el) return;
  let start = 0;
  const step  = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = formatNumber(Math.floor(start));
  }, 16);
}
function confirmDelete(msg = 'Delete this item?') { return confirm(msg); }
function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
