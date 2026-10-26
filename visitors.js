/* Visitors Analytics Page JS */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();

  try {
    const data = await Api.getVisitorAnalytics();

    // Mini stats
    animateCount(document.getElementById('vTotal'),  data.totalVisitors  || 0);
    animateCount(document.getElementById('vToday'),  data.todayVisitors  || 0);
    animateCount(document.getElementById('vWeek'),   data.weekVisitors   || 0);
    animateCount(document.getElementById('vUnique'), data.uniqueVisitors || 0);

    // Line chart
    const daily = data.dailyStats || [];
    if (daily.length) {
      new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
          labels: daily.map(d => { const dt = new Date(d.date || d.DATE); return dt.toLocaleDateString('en', { month:'short', day:'numeric' }); }),
          datasets: [{ label: 'Visitors', data: daily.map(d => d.count || d.COUNT || 0), borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.08)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#00d4ff', pointRadius: 3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892a4' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892a4' } } } }
      });
    }

    // Pie chart — devices
    const devices = data.deviceStats || [];
    if (devices.length) {
      new Chart(document.getElementById('deviceChart'), {
        type: 'doughnut',
        data: {
          labels: devices.map(d => d.label || d.LABEL),
          datasets: [{ data: devices.map(d => d.count || d.COUNT || 0), backgroundColor: ['#00d4ff','#a855f7','#10f59e','#fbbf24'], borderColor: '#050a14', borderWidth: 3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8892a4', padding: 15 } } } }
      });
    }

    // Browser bars
    const browsers = data.browserStats || [];
    const bContainer = document.getElementById('browserBars');
    if (!browsers.length) {
      bContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">🌐</div><div class="empty-title">No data yet</div></div>';
    } else {
      const max = Math.max(...browsers.map(b => Number(b.count || b.COUNT || 0)));
      bContainer.innerHTML = browsers.slice(0, 6).map(b => {
        const label = b.label || b.LABEL || 'Unknown';
        const count = b.count || b.COUNT || 0;
        return `<div style="margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.3rem">
            <span style="color:var(--text-primary)">${escHtml(label)}</span>
            <span style="color:var(--text-muted);font-family:var(--font-mono)">${count}</span>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${max ? Math.round(count/max*100) : 0}%"></div></div>
        </div>`;
      }).join('');
    }

    // Recent visits table
    const recent = data.recentVisitors || [];
    const tbody = document.getElementById('recentVisits');
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text-muted)">No visits yet</td></tr>';
    } else {
      tbody.innerHTML = recent.map(v => `
        <tr>
          <td style="font-family:var(--font-mono);font-size:.75rem">${escHtml(v.ipAddress || '—')}</td>
          <td><span class="badge badge-blue">${escHtml(v.deviceType || '—')}</span></td>
          <td style="font-size:.8rem">${escHtml(v.browser || '—')}</td>
          <td style="font-size:.8rem">${escHtml(v.os || '—')}</td>
          <td style="font-size:.75rem;font-family:var(--font-mono);color:var(--text-muted)">${v.visitedAt ? new Date(v.visitedAt).toLocaleString() : '—'}</td>
        </tr>
      `).join('');
    }

  } catch (err) {
    Toast.error('Failed to load visitor data: ' + err.message);
  } finally {
    hideLoader();
  }
});
