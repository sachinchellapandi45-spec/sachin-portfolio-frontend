/* Skills Page JS */
let _skillsMap = {};

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  initSidebar();
  loadSkills();
  document.getElementById('addSkillBtn').addEventListener('click', () => openSkillModal());
});

async function loadSkills() {
  const tbody = document.getElementById('skillsBody');
  try {
    const skills = await Api.getAdminSkills();
    _skillsMap = {};
    if (!skills || !skills.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⚡</div><div class="empty-title">No skills yet</div><div class="empty-desc">Add your first skill.</div></div></td></tr>';
      return;
    }
    skills.forEach(s => { _skillsMap[s.id] = s; });
    tbody.innerHTML = skills.map(s => `
      <tr>
        <td>${s.iconUrl ? `<img src="${escHtml(s.iconUrl)}" class="skill-icon-preview" alt="${escHtml(s.name)}" onerror="this.style.display='none'"/>` : '<span style="font-size:1.2rem">⚡</span>'}</td>
        <td style="font-weight:600;color:var(--text-primary)">${escHtml(s.name)}</td>
        <td><span class="badge badge-purple">${escHtml(s.category || 'Other')}</span></td>
        <td style="min-width:120px">
          <div style="display:flex;align-items:center;gap:.5rem">
            <div class="progress-bar-wrap" style="flex:1"><div class="progress-bar" style="width:${s.percentage||80}%"></div></div>
            <span style="font-size:.75rem;font-family:var(--font-mono);color:var(--text-muted)">${s.percentage||80}%</span>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:.8rem;color:var(--text-muted)">${s.displayOrder||0}</td>
        <td><span class="badge ${s.isActive ? 'badge-green' : 'badge-red'}">${s.isActive ? '● Active' : '○ Hidden'}</span></td>
        <td>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-secondary btn-sm" onclick="openSkillModalById(${s.id})">✏ Edit</button>
            <button class="btn btn-danger btn-sm"    onclick="deleteSkill(${s.id})">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    Toast.error('Failed to load skills: ' + err.message);
  } finally { hideLoader(); }
}

function openSkillModalById(id) {
  openSkillModal(_skillsMap[id] || null);
}

function openSkillModal(skill = null) {
  const isEdit = !!skill;
  document.getElementById('skillModalTitle').textContent = isEdit ? 'Edit Skill' : 'Add Skill';
  document.getElementById('skillId').value       = skill?.id || '';
  document.getElementById('skillName').value     = skill?.name || '';
  document.getElementById('skillCategory').value = skill?.category || 'Languages';
  document.getElementById('skillPercentage').value = skill?.percentage || 80;
  document.getElementById('percentageDisplay').textContent = skill?.percentage || 80;
  document.getElementById('skillIcon').value     = skill?.iconUrl || '';
  document.getElementById('skillOrder').value    = skill?.displayOrder ?? 0;
  document.getElementById('skillActive').checked = skill?.isActive ?? true;
  document.getElementById('skillModal').classList.add('open');
}

async function saveSkill() {
  const id   = document.getElementById('skillId').value;
  const btn  = document.getElementById('saveSkillBtn');
  const name = document.getElementById('skillName').value.trim();
  if (!name) { Toast.error('Skill name is required'); return; }

  const data = {
    name,
    category:     document.getElementById('skillCategory').value,
    percentage:   parseInt(document.getElementById('skillPercentage').value),
    iconUrl:      document.getElementById('skillIcon').value.trim(),
    displayOrder: parseInt(document.getElementById('skillOrder').value) || 0,
    isActive:     document.getElementById('skillActive').checked,
  };

  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    if (id) {
      await Api.updateSkill(id, data);
      Toast.success('Skill updated!');
    } else {
      await Api.createSkill(data);
      Toast.success('Skill created!');
    }
    closeModal('skillModal');
    loadSkills();
  } catch (err) {
    Toast.error('Failed to save: ' + err.message);
  } finally { btn.disabled = false; btn.textContent = 'Save Skill'; }
}

async function deleteSkill(id) {
  if (!confirmDelete('Delete this skill from the portfolio?')) return;
  try {
    await Api.deleteSkill(id);
    Toast.success('Skill deleted');
    loadSkills();
  } catch (err) { Toast.error('Failed to delete: ' + err.message); }
}
