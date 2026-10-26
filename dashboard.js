/* Dashboard JS */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();

  try {
    const [stats, analytics, contacts] = await Promise.all([
      Api.getDashboardStats(),
      Api.getVisitorAnalytics().catch(() => null),
      Api.getContacts('', null, 0, 5).catch(() => null),
    ]);

    // Unread badge
    const badge = document.getElementById('unreadBadge');
    if (stats.unreadContacts > 0) { badge.textContent = stats.unreadContacts; badge.style.display = 'inline-block'; }

    // Animate stat counters
    [
      ['totalVisitors',    stats.totalVisitors],
      ['todayVisitors',    stats.todayVisitors],
      ['totalContacts',    stats.totalContacts],
      ['resumeDownloads',  stats.resumeDownloads],
      ['monthVisitors',    stats.monthVisitors],
      ['weekVisitorsCard', stats.weekVisitors],
      ['totalProjects',    stats.totalProjects],
      ['totalSkills',      stats.totalSkills],
    ].forEach(([id, val]) => animateCount(document.getElementById(id), val || 0));

    // Sub-labels
    setText('uniqueVisitorsSub', `${formatNumber(stats.uniqueVisitors || 0)} unique IPs`);
    setText('weekVisitorsSub',   `${formatNumber(stats.weekVisitors   || 0)} this week`);
    setText('unreadSub',         `${stats.unreadContacts || 0} unread`);
    setText('unreadTrend',       `${stats.unreadContacts || 0} new`);
    setText('resumeSubStat',     `${formatNumber(stats.todayResumeDownloads || 0)} today`);
    setText('skillsSub',         `${stats.totalSkills || 0} skills`);
    setText('lastUpdated',       `Updated ${new Date().toLocaleTimeString()}`);

    // Charts from visitor analytics
    if (analytics) {
      renderLineChart(analytics.dailyStats || []);
      renderPieChart(analytics.deviceStats || []);
      renderBrowserBars(analytics.browserStats || []);
    }

    // Recent messages
    if (contacts) renderRecentMessages(contacts.content || []);

  } catch (err) {
    Toast.error('Failed to load dashboard: ' + err.message);
  } finally {
    hideLoader();
  }
});

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function renderLineChart(data) {
  const ctx = document.getElementById('visitorLineChart');
  if (!ctx || !data.length) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => { const dt = new Date(d.date || d.DATE); return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' }); }),
      datasets: [{ label: 'Visitors', data: data.map(d => d.count || d.COUNT || 0), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#00d4ff', pointRadius: 3 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892a4', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892a4', font: { size: 11 } } } } }
  });
}

function renderPieChart(data) {
  const ctx = document.getElementById('devicePieChart');
  if (!ctx || !data.length) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label || d.LABEL),
      datasets: [{ data: data.map(d => d.count || d.COUNT || 0), backgroundColor: ['#00d4ff','#a855f7','#10f59e','#fbbf24'], borderColor: '#050a14', borderWidth: 3 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8892a4', padding: 15, font: { size: 12 } } } } }
  });
}

function renderBrowserBars(data) {
  const container = document.getElementById('browserStats');
  if (!container) return;
  if (!data.length) { container.innerHTML = '<div class="empty-state"><div class="empty-icon">🌐</div><div class="empty-title">No browser data yet</div></div>'; return; }
  const max = Math.max(...data.map(d => Number(d.count || d.COUNT || 0)));
  container.innerHTML = data.slice(0, 6).map(d => {
    const label = d.label || d.LABEL || 'Unknown';
    const count = d.count || d.COUNT || 0;
    return `<div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.35rem">
        <span style="color:var(--text-primary)">${escHtml(label)}</span>
        <span style="color:var(--text-muted);font-family:var(--font-mono)">${count}</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${max ? Math.round(count/max*100) : 0}%"></div></div>
    </div>`;
  }).join('');
}

function renderRecentMessages(messages) {
  const tbody = document.getElementById('recentMessages');
  if (!tbody) return;
  if (!messages.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:2rem">No messages yet</td></tr>'; return; }
  tbody.innerHTML = messages.map(m => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary)">${escHtml(m.name)}</td>
      <td style="font-size:.82rem">${escHtml(m.email)}</td>
      <td><span class="badge ${m.isRead ? 'badge-green' : 'badge-blue'}">${m.isRead ? '✓ Read' : '● New'}</span></td>
      <td style="font-size:.78rem;font-family:var(--font-mono)">${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
    </tr>
  `).join('');
}
