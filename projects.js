/* Projects Page JS */
let _projectsMap = {};

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();
  loadProjects();
  document.getElementById('addProjectBtn').addEventListener('click', () => openModal());
});

async function loadProjects() {
  const tbody = document.getElementById('projectsBody');
  try {
    const projects = await Api.getAdminProjects();
    _projectsMap = {};
    if (!projects || !projects.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">💼</div><div class="empty-title">No projects yet</div><div class="empty-desc">Add your first project.</div></div></td></tr>';
      return;
    }
    projects.forEach(p => { _projectsMap[p.id] = p; });
    tbody.innerHTML = projects.map(p => `
      <tr>
        <td style="font-weight:600;color:var(--text-primary)">${escHtml(p.title)}</td>
        <td style="font-size:.75rem;max-width:200px">
          ${(p.techStack || '').split(',').map(t => `<span style="display:inline-block;padding:.1rem .4rem;margin:.1rem;background:rgba(0,212,255,0.08);border-radius:4px;font-size:.7rem;color:var(--neon-blue)">${escHtml(t.trim())}</span>`).join('')}
        </td>
        <td><span class="badge ${p.status === 'ACTIVE' ? 'badge-green' : p.status === 'ARCHIVED' ? 'badge-red' : 'badge-yellow'}">${p.status || '—'}</span></td>
        <td style="text-align:center">${p.isFeatured ? '⭐' : '—'}</td>
        <td>${p.githubLink ? `<a href="${escHtml(p.githubLink)}" target="_blank" rel="noopener noreferrer" style="color:var(--neon-blue);font-size:.78rem">⚡ GitHub</a>` : '—'}</td>
        <td>${p.demoLink   ? `<a href="${escHtml(p.demoLink)}"   target="_blank" rel="noopener noreferrer" style="color:var(--neon-cyan);font-size:.78rem">🚀 Demo</a>`   : '—'}</td>
        <td>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-secondary btn-sm" onclick="openModalById(${p.id})">✏ Edit</button>
            <button class="btn btn-danger btn-sm"    onclick="deleteProject(${p.id})">🗑 Del</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    Toast.error('Failed to load projects: ' + err.message);
  } finally { hideLoader(); }
}

function openModalById(id) {
  openModal(_projectsMap[id] || null);
}

function openModal(project = null) {
  const isEdit = !!project;
  document.getElementById('projectModalTitle').textContent = isEdit ? 'Edit Project' : 'Add Project';
  document.getElementById('projectId').value     = project?.id || '';
  document.getElementById('projectTitle').value  = project?.title || '';
  document.getElementById('projectDesc').value   = project?.description || '';
  document.getElementById('projectTech').value   = project?.techStack || '';
  document.getElementById('projectGithub').value = project?.githubLink || '';
  document.getElementById('projectDemo').value   = project?.demoLink || '';
  document.getElementById('projectImage').value  = project?.imageUrl || '';
  document.getElementById('projectStatus').value = project?.status || 'COMING_SOON';
  document.getElementById('projectOrder').value  = project?.displayOrder ?? 0;
  document.getElementById('projectFeatured').checked = project?.isFeatured || false;
  document.getElementById('projectModal').classList.add('open');
}

async function saveProject() {
  const id  = document.getElementById('projectId').value;
  const btn = document.getElementById('saveProjectBtn');
  const title = document.getElementById('projectTitle').value.trim();
  if (!title) { Toast.error('Title is required'); return; }

  const data = {
    title,
    description:  document.getElementById('projectDesc').value.trim(),
    techStack:    document.getElementById('projectTech').value.trim(),
    githubLink:   document.getElementById('projectGithub').value.trim(),
    demoLink:     document.getElementById('projectDemo').value.trim(),
    imageUrl:     document.getElementById('projectImage').value.trim(),
    status:       document.getElementById('projectStatus').value,
    displayOrder: parseInt(document.getElementById('projectOrder').value) || 0,
    isFeatured:   document.getElementById('projectFeatured').checked,
  };

  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    if (id) {
      await Api.updateProject(id, data);
      Toast.success('Project updated!');
    } else {
      await Api.createProject(data);
      Toast.success('Project created!');
    }
    closeModal('projectModal');
    loadProjects();
  } catch (err) {
    Toast.error('Failed to save: ' + err.message);
  } finally { btn.disabled = false; btn.textContent = 'Save Project'; }
}

async function deleteProject(id) {
  if (!confirmDelete('Delete this project from the portfolio?')) return;
  try {
    await Api.deleteProject(id);
    Toast.success('Project deleted');
    loadProjects();
  } catch (err) { Toast.error('Failed to delete: ' + err.message); }
}
