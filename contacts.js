/* Contacts Page JS */
let currentPage = 0, currentSearch = '', currentFilter = '';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();
  loadMessages();

  document.getElementById('searchInput').addEventListener('input', debounce(() => {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 0; loadMessages();
  }, 400));

  document.getElementById('filterRead').addEventListener('change', () => {
    currentFilter = document.getElementById('filterRead').value;
    currentPage = 0; loadMessages();
  });

  document.getElementById('refreshBtn').addEventListener('click', () => loadMessages());

  // Update unread badge
  Api.getContacts('', false, 0, 1).then(d => {
    const badge = document.getElementById('unreadBadge');
    if (d.totalElements > 0) { badge.textContent = d.totalElements; badge.style.display = 'inline-block'; }
  }).catch(() => {});
});

let _messagesCache = {};

async function loadMessages() {
  const tbody = document.getElementById('messagesBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">Loading...</td></tr>';

  try {
    const isRead = currentFilter !== '' ? currentFilter === 'true' : null;
    const data   = await Api.getContacts(currentSearch, isRead, currentPage, 15);
    const messages = data.content || [];
    _messagesCache = {};
    messages.forEach(m => { _messagesCache[m.id] = m; });

    if (!messages.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✉</div><div class="empty-title">No messages found</div><div class="empty-desc">Messages from your portfolio contact form will appear here.</div></div></td></tr>';
    } else {
      tbody.innerHTML = messages.map(m => `
        <tr id="row-${m.id}">
          <td style="font-weight:${m.isRead ? '400' : '600'};color:var(--text-primary)">${escHtml(m.name)}</td>
          <td style="font-size:.8rem">${escHtml(m.email)}</td>
          <td style="font-size:.82rem;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(m.subject || '(no subject)')}</td>
          <td style="font-size:.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)">${escHtml(m.message || '')}</td>
          <td><span class="badge ${m.isRead ? 'badge-green' : 'badge-blue'}">${m.isRead ? '✓ Read' : '● New'}</span></td>
          <td style="font-size:.75rem;font-family:var(--font-mono);color:var(--text-muted)">${m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}</td>
          <td>
            <div style="display:flex;gap:.4rem">
              <button class="btn btn-secondary btn-sm" onclick="viewMessage(${m.id})">👁 View</button>
              <button class="btn btn-secondary btn-sm" onclick="toggleRead(${m.id}, ${m.isRead})">${m.isRead ? '📭' : '✓'}</button>
              <button class="btn btn-danger btn-sm" onclick="deleteMsg(${m.id})">🗑</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    renderPagination(data.totalPages, data.number);
  } catch (err) {
    Toast.error('Failed to load messages: ' + err.message);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#f87171">Failed to load messages.</td></tr>';
  } finally {
    hideLoader();
  }
}

async function viewMessage(id) {
  try {
    const msg = _messagesCache[id];
    if (!msg) { Toast.error('Message not found'); return; }
    document.getElementById('viewModalTitle').textContent = `Message from ${msg.name}`;
    document.getElementById('viewModalBody').innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem 0;color:var(--text-muted);font-size:.8rem;width:80px">From</td><td style="padding:.5rem 0;font-weight:600">${escHtml(msg.name)}</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem 0;color:var(--text-muted);font-size:.8rem">Email</td><td style="padding:.5rem 0"><a href="mailto:${escHtml(msg.email)}" style="color:var(--neon-blue)">${escHtml(msg.email)}</a></td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem 0;color:var(--text-muted);font-size:.8rem">Subject</td><td style="padding:.5rem 0">${escHtml(msg.subject || '—')}</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:.5rem 0;color:var(--text-muted);font-size:.8rem">Date</td><td style="padding:.5rem 0;font-size:.82rem;font-family:var(--font-mono)">${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '—'}</td></tr>
      </table>
      <div style="margin-top:1rem;background:rgba(255,255,255,0.03);border-radius:10px;padding:1rem;line-height:1.7;white-space:pre-wrap;font-size:.88rem">${escHtml(msg.message)}</div>
    `;
    document.getElementById('viewModal').classList.add('open');
    // Auto-mark as read if unread
    if (!msg.isRead) {
      await Api.markContactRead(id, true).catch(() => {});
      msg.isRead = true;
      const badge = document.querySelector(`#row-${id} .badge`);
      if (badge) { badge.className = 'badge badge-green'; badge.textContent = '✓ Read'; }
    }
  } catch (err) { Toast.error('Failed to display message'); }
}

async function toggleRead(id, currentRead) {
  try {
    await Api.markContactRead(id, !currentRead);
    Toast.success(currentRead ? 'Marked as unread' : 'Marked as read');
    loadMessages();
  } catch (err) { Toast.error('Failed to update status'); }
}

async function deleteMsg(id) {
  if (!confirmDelete('Delete this message? This cannot be undone.')) return;
  try {
    await Api.deleteContact(id);
    Toast.success('Message deleted');
    loadMessages();
  } catch (err) { Toast.error('Failed to delete message'); }
}

function renderPagination(totalPages, current) {
  const el = document.getElementById('pagination');
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }
  el.innerHTML = [
    `<button class="page-btn" ${current === 0 ? 'disabled' : ''} onclick="goPage(${current-1})">‹</button>`,
    ...Array.from({length: totalPages}, (_, i) => `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goPage(${i})">${i+1}</button>`),
    `<button class="page-btn" ${current === totalPages-1 ? 'disabled' : ''} onclick="goPage(${current+1})">›</button>`,
  ].join('');
}

function goPage(page) { currentPage = page; loadMessages(); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
