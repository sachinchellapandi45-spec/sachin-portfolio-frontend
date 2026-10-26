/* ============================================
   SACHIN PORTFOLIO — COMPLETE SCRIPT
   v4.0 | Fully Connected to Spring Boot Backend
   ============================================ */

'use strict';

// ============================================
// API CONFIGURATION
// Reads from config.js — change BACKEND_URL there
// ============================================
const API = (typeof CONFIG !== 'undefined' && CONFIG.BACKEND_URL)
  ? CONFIG.BACKEND_URL
  : 'http://localhost:8080';

// ============================================
// LOADING SCREEN
// ============================================
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = '';
    initRevealAnimations();
    // Track this visit after page fully loads
    trackVisit();
    // Load dynamic content from backend
    loadPublicProjects();
    loadPublicSkills();
    loadVisitorCount();
  }, 2000);
});
document.body.style.overflow = 'hidden';

// ============================================
// VISITOR TRACKING — POST /api/visit
// ============================================
function trackVisit() {
  const sessionId = sessionStorage.getItem('portfolio_sid') || generateSid();
  sessionStorage.setItem('portfolio_sid', sessionId);

  fetch(`${API}/api/visit?sessionId=${encodeURIComponent(sessionId)}&page=/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {}); // Silent fail — visitor tracking should never break UX
}

function generateSid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================
// LOAD VISITOR COUNT — GET /api/visit/count
// ============================================
async function loadVisitorCount() {
  try {
    const res = await fetch(`${API}/api/visit/count`);
    if (!res.ok) return;
    const data = await res.json();
    const el = document.getElementById('visitorCount');
    if (el && data.total !== undefined) {
      el.textContent = formatNumber(data.total);
    }
    const todayEl = document.getElementById('visitorToday');
    if (todayEl && data.today !== undefined) {
      todayEl.textContent = formatNumber(data.today);
    }
  } catch (_) {}
}

// ============================================
// LOAD PUBLIC PROJECTS — GET /api/projects
// ============================================
async function loadPublicProjects() {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  try {
    const res = await fetch(`${API}/api/projects`);
    if (!res.ok) return;
    const projects = await res.json();
    if (!projects || !projects.length) return;

    container.style.display = 'grid';
    const comingSoon = document.getElementById('projectsComingSoon');
    if (comingSoon) comingSoon.style.display = 'none';

    container.innerHTML = projects.map((p, i) => `
      <div class="project-card reveal-up" style="animation-delay:${i * 0.1}s">
        <div class="project-card-inner">
          <div class="project-img-wrap" ${!p.imageUrl ? 'style="display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center, rgba(0,212,255,0.12) 0%, rgba(5,10,20,0.85) 75%);border-bottom:1px solid rgba(0,212,255,0.1);"' : ''}>
            ${p.imageUrl
              ? `<img src="${escHtml(p.imageUrl)}" alt="${escHtml(p.title)}" class="project-img" loading="lazy"/>`
              : `<span style="font-size:2.8rem;filter:drop-shadow(0 0 12px rgba(0,212,255,0.4));">${i === 0 ? '💻' : i === 1 ? '🌐' : '⚡'}</span>`}
          </div>
          <div class="project-content">
            <div class="project-header">
              <h3 class="project-title">${escHtml(p.title)}</h3>
              ${p.isFeatured ? '<span class="project-featured-badge">⭐ Featured</span>' : ''}
            </div>
            ${p.description ? `<p class="project-desc">${escHtml(p.description)}</p>` : ''}
            ${p.techStack ? `<div class="project-tech">${p.techStack.split(',').map(t => `<span class="tech-tag">${escHtml(t.trim())}</span>`).join('')}</div>` : ''}
            <div class="project-links">
              ${p.githubLink ? `<a href="${escHtml(p.githubLink)}" target="_blank" rel="noopener noreferrer" class="project-link btn-secondary magnetic-btn"><span>⚡ GitHub</span></a>` : ''}
              ${p.demoLink   ? `<a href="${escHtml(p.demoLink)}"   target="_blank" rel="noopener noreferrer" class="project-link btn-primary magnetic-btn"><span>🚀 Live Demo</span></a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Re-observe newly injected project cards
    document.querySelectorAll('.project-card.reveal-up').forEach(el => {
      if (window._revealObserver) window._revealObserver.observe(el);
    });

    attachHoverEffects();
    attachMagneticButtons();
  } catch (_) {}
}

// ============================================
// LOAD PUBLIC SKILLS — GET /api/skills
// ============================================
async function loadPublicSkills() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;

  try {
    const res = await fetch(`${API}/api/skills`);
    if (!res.ok) return;
    const skills = await res.json();
    if (!skills || !skills.length) return;

    const catIcons = {
      'Languages': '🔤',
      'Frontend': '🎨',
      'Backend': '⚙️',
      'Database': '🗄️',
      'Tools': '🛠️',
      'DevOps': '☁️',
      'Other': '⚡'
    };

    // Group by category
    const grouped = skills.reduce((acc, s) => {
      const cat = s.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});

    container.innerHTML = Object.entries(grouped).map(([cat, items], idx) => `
      <div class="skill-category reveal-up" style="animation-delay:${idx * 0.08}s">
        <div class="skill-cat-header">
          <span class="skill-cat-icon">${catIcons[cat] || '⚡'}</span>
          <h3>${escHtml(cat)}</h3>
        </div>
        <div class="skills-grid">
          ${items.map(s => {
            const pct = s.percentage || 80;
            const iconHtml = s.iconUrl
              ? `<img src="${escHtml(s.iconUrl)}" alt="${escHtml(s.name)}" onerror="this.onerror=null;this.parentElement.innerHTML='<span style=\\'font-size:1.5rem\\'>⚡</span>'"/>`
              : '<span style="font-size:1.5rem">⚡</span>';
            return `
              <div class="skill-card" data-skill="${pct}">
                <div class="skill-icon-wrap">
                  ${iconHtml}
                </div>
                <div class="skill-info">
                  <div class="skill-name">${escHtml(s.name)}</div>
                  <div class="skill-bar"><div class="skill-fill" data-width="${pct}" style="width:0%"></div></div>
                  <div class="skill-percent">${pct}%</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Trigger skill bar animations
    document.querySelectorAll('.skill-category').forEach(cat => {
      if (window._skillObserver) window._skillObserver.observe(cat);
      if (window._revealObserver) window._revealObserver.observe(cat);
    });

    attachSkillCardGlow();
    attachHoverEffects();
  } catch (_) {}
}

// ============================================
// CUSTOM CURSOR
// ============================================
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const mouseGlow  = document.getElementById('mouseGlow');

let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  if (cursorDot)  { cursorDot.style.left  = cursorX + 'px'; cursorDot.style.top  = cursorY + 'px'; }
  if (mouseGlow)  { mouseGlow.style.left  = cursorX + 'px'; mouseGlow.style.top  = cursorY + 'px'; }
});

function animateCursor() {
  ringX += (cursorX - ringX) * 0.12;
  ringY += (cursorY - ringY) * 0.12;
  if (cursorRing) { cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px'; }
  requestAnimationFrame(animateCursor);
}
animateCursor();

function attachHoverEffects() {
  document.querySelectorAll('a, button, .skill-card, .magnetic-btn, .project-card').forEach(el => {
    if (el._hoverBound) return;
    el._hoverBound = true;
    el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing && cursorRing.classList.remove('hovering'));
  });
}
attachHoverEffects();

// ============================================
// MAGNETIC BUTTONS
// ============================================
function attachMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    if (btn._magBound) return;
    btn._magBound = true;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}
attachMagneticButtons();

// ============================================
// PARTICLE CANVAS — disabled
// ============================================
const canvas = document.getElementById('particleCanvas');
if (canvas) canvas.style.display = 'none';

// ============================================
// NAVBAR
// ============================================
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('open');
  });
}

if (navLinks) {
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ============================================
// ACTIVE NAV SECTION
// ============================================
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const top  = section.offsetTop;
    const id   = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < top + section.offsetHeight) {
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.dataset.section === id);
      });
    }
  });
}
window.addEventListener('scroll', highlightActiveSection, { passive: true });

// ============================================
// SCROLL PROGRESS
// ============================================
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!scrollProgress) return;
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.style.width = ((winScroll / height) * 100) + '%';
}, { passive: true });

// ============================================
// TYPING ANIMATION
// ============================================
const typingEl = document.getElementById('typingText');
const texts = ['Full Stack Developer', 'Java Full Stack Developer'];
let textIndex = 0, charIndex = 0, isDeleting = false;

function typeText() {
  const current = texts[textIndex];
  charIndex += isDeleting ? -1 : 1;
  if (typingEl) typingEl.textContent = current.substring(0, charIndex);

  let speed = isDeleting ? 50 : 85;
  if (!isDeleting && charIndex === current.length) { speed = 2200; isDeleting = true; }
  else if (isDeleting && charIndex === 0) { isDeleting = false; textIndex = (textIndex + 1) % texts.length; speed = 400; }

  setTimeout(typeText, speed);
}
setTimeout(typeText, 3200);

// ============================================
// REVEAL ANIMATIONS
// ============================================
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseFloat(el.style.animationDelay || 0) * 1000;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  window._revealObserver = observer;
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade').forEach(el => observer.observe(el));
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounter(el, target) {
  let current = 0;
  const step  = target / 80;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 18);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.count));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.counter-value').forEach(el => counterObserver.observe(el));

// ============================================
// SKILL BAR ANIMATIONS
// ============================================
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        const width = bar.dataset.width;
        setTimeout(() => { bar.style.width = width + '%'; }, i * 120);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
window._skillObserver = skillObserver;
document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));

// ============================================
// BACK TO TOP
// ============================================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ============================================
// CONTACT FORM — POST /api/contact
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = document.getElementById('contactSubmitBtn');
    const btnSpan = btn ? btn.querySelector('span') : null;
    const name    = document.getElementById('formName')?.value?.trim();
    const email   = document.getElementById('formEmail')?.value?.trim();
    const subject = document.getElementById('formSubject')?.value?.trim() || 'Portfolio Contact';
    const message = document.getElementById('formMessage')?.value?.trim();

    if (!name || !email || !message) { showToast('⚠ Please fill all required fields.'); return; }

    if (btn)     { btn.disabled = true; }
    if (btnSpan) { btnSpan.textContent = 'Sending... ✈'; }

    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        showToast('✅ Message sent successfully!');
        contactForm.reset();
        if (btnSpan) btnSpan.textContent = 'Message Sent! 🎉';
        if (btn) btn.style.background = 'linear-gradient(135deg, #10f59e, #00d4ff)';
        setTimeout(() => {
          if (btnSpan) btnSpan.textContent = 'Send Message 🚀';
          if (btn)     { btn.disabled = false; btn.style.background = ''; }
        }, 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('❌ ' + (err.message || 'Failed to send. Please try again.'));
        if (btn)     btn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'Send Message 🚀';
      }
    } catch (_) {
      // Fallback to mailto
      const mailtoLink = `mailto:sachinchellapandi45@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoLink;
      if (btn)     btn.disabled = false;
      if (btnSpan) btnSpan.textContent = 'Send Message 🚀';
    }
  });
}

// ============================================
// RESUME DOWNLOAD — POST /api/resume/download
// ============================================
const downloadResume = document.getElementById('downloadResume');
if (downloadResume) {
  downloadResume.addEventListener('click', async (e) => {
    e.preventDefault();
    // Track download count silently
    fetch(`${API}/api/resume/download`, { method: 'POST' }).catch(() => {});
    // To enable real download: add data-url="https://link-to-your-resume.pdf" to the button in index.html
    const resumeUrl = downloadResume.dataset.url || '';
    if (resumeUrl && resumeUrl !== '#') {
      const a = document.createElement('a');
      a.href = resumeUrl;
      a.target = '_blank';
      a.download = 'Sachin_C_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('📄 Resume downloading...');
    } else {
      // Fallback: open Gmail compose to request the resume
      const subject = encodeURIComponent('Resume Request \u2014 C. Sachin');
      const body    = encodeURIComponent('Hi Sachin,\n\nCould you please share your latest resume?\n\nThank you!');
      window.open(`mailto:sachinchellapandi45@gmail.com?subject=${subject}&body=${body}`);
      showToast('\uD83D\uDCE7 Opening email to request resume...');
    }
  });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, duration = 3500) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '6rem', right: '2rem',
    background: 'rgba(5,10,20,0.95)',
    border: '1px solid rgba(0,212,255,0.3)',
    borderRadius: '12px', padding: '0.9rem 1.5rem',
    color: '#f0f6ff', fontSize: '0.9rem',
    fontFamily: 'Space Grotesk, sans-serif', fontWeight: '500',
    zIndex: '9999', backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.1)',
    transform: 'translateX(120%)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ============================================
// SMOOTH ANCHOR SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72');
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

// ============================================
// STAGGER GROUPS
// ============================================
const staggerObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('.counter-card, .skill-card, .contact-info-card, .exp-info-item');
      children.forEach((child, i) => {
        child.style.opacity  = '0';
        child.style.transform = 'translateY(20px)';
        child.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
        setTimeout(() => { child.style.opacity = '1'; child.style.transform = 'translateY(0)'; }, i * 80 + 200);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.about-counters, .skills-grid, .contact-info-grid').forEach(el => staggerObserver.observe(el));

// ============================================
// TIMELINE ANIMATION
// ============================================
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateX(0)';
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline-item').forEach(item => {
  item.style.opacity   = '0';
  item.style.transform = 'translateX(30px)';
  item.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
  timelineObserver.observe(item);
});

// ============================================
// HERO PARALLAX
// ============================================
const heroScene = document.querySelector('.hero-scene');
window.addEventListener('mousemove', (e) => {
  if (!heroScene) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 15;
  const y = (e.clientY / window.innerHeight - 0.5) * 15;
  heroScene.style.transform  = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
  heroScene.style.transition = 'transform 0.1s ease';
});

// ============================================
// SKILL CARD GLOW
// ============================================
function attachSkillCardGlow() {
  document.querySelectorAll('.skill-card').forEach(card => {
    if (card._glowBound) return;
    card._glowBound = true;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width)  * 100}%`);
      card.style.setProperty('--mouse-y', `${((e.clientY - rect.top)  / rect.height) * 100}%`);
    });
  });
}
attachSkillCardGlow();

// ============================================
// BACKGROUND GRADIENT
// ============================================
const bgShift = document.createElement('div');
bgShift.style.cssText = `
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(ellipse at 20% 50%,rgba(0,212,255,0.04) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 30%,rgba(168,85,247,0.04) 0%,transparent 60%);
`;
document.body.insertBefore(bgShift, document.body.firstChild);

// ============================================
// HERO BADGE FADE ON SCROLL
// ============================================
window.addEventListener('scroll', () => {
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge && window.scrollY < 500) heroBadge.style.opacity = 1 - window.scrollY / 500;
}, { passive: true });

// ============================================
// KEYBOARD ACCESSIBILITY
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hamburger && hamburger.classList.remove('active');
    navLinks  && navLinks.classList.remove('open');
    // Also close admin modal if open
    const adminOverlay = document.getElementById('adminModalOverlay');
    if (adminOverlay && adminOverlay.classList.contains('open')) {
      adminOverlay.classList.remove('open');
    }
  }
});

// ============================================
// UTILITY
// ============================================
function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n || 0);
}

// ============================================
// ADMIN LOGIN MODAL
// ============================================
(function () {
  const overlay    = document.getElementById('adminModalOverlay');
  const openBtn    = document.getElementById('adminLoginBtn');
  const closeBtn   = document.getElementById('adminModalClose');
  const form       = document.getElementById('adminLoginForm');
  const errorBox   = document.getElementById('adminErrorBox');
  const errorMsg   = document.getElementById('adminErrorMsg');
  const submitBtn  = document.getElementById('adminSubmitBtn');
  const submitText = document.getElementById('adminSubmitText');
  const pwdInput   = document.getElementById('adminPassword');
  const pwdToggle  = document.getElementById('adminPwdToggle');

  if (!overlay || !openBtn) return;

  const existingToken = localStorage.getItem('admin_token');
  if (existingToken) {
    const btnSpan = openBtn.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Dashboard';
  }

  openBtn.addEventListener('click', () => {
    if (localStorage.getItem('admin_token')) {
      window.location.href = 'admin/dashboard.html';
      return;
    }
    overlay.classList.add('open');
    document.getElementById('adminUsername')?.focus();
    if (errorBox) errorBox.classList.remove('show');
  });

  // Auto-open modal if ?login or ?admin in URL
  if (window.location.search.includes('login') || window.location.search.includes('admin')) {
    overlay.classList.add('open');
    setTimeout(() => document.getElementById('adminUsername')?.focus(), 250);
  }

  function closeModal() {
    overlay.classList.remove('open');
    if (form)       form.reset();
    if (errorBox)   errorBox.classList.remove('show');
    if (submitBtn)  submitBtn.disabled = false;
    if (submitText) submitText.textContent = '🔐 Login to Admin Panel';
  }

  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  if (pwdToggle && pwdInput) {
    pwdToggle.addEventListener('click', () => {
      const hidden = pwdInput.type === 'password';
      pwdInput.type = hidden ? 'text' : 'password';
      pwdToggle.textContent = hidden ? '🙈' : '👁';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('adminUsername')?.value?.trim();
      const password = pwdInput?.value;

      if (!username || !password) {
        if (errorMsg) errorMsg.textContent = 'Please enter username and password.';
        if (errorBox) errorBox.classList.add('show');
        return;
      }

      if (submitBtn)  submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Authenticating...';
      if (errorBox)   errorBox.classList.remove('show');

      try {
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (errorMsg) errorMsg.textContent = data.message || 'Invalid username or password.';
          if (errorBox) errorBox.classList.add('show');
          if (submitBtn)  submitBtn.disabled = false;
          if (submitText) submitText.textContent = '🔐 Login to Admin Panel';
          return;
        }

        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify({ username: data.username, role: data.role }));
        if (submitText) submitText.textContent = '✅ Login Successful!';
        setTimeout(() => { window.location.href = 'admin/dashboard.html'; }, 700);

      } catch (_) {
        if (errorMsg) errorMsg.textContent = 'Cannot connect to server. Is the backend running?';
        if (errorBox) errorBox.classList.add('show');
        if (submitBtn)  submitBtn.disabled = false;
        if (submitText) submitText.textContent = '🔐 Login to Admin Panel';
      }
    });
  }
})();

// ============================================
// CONSOLE SIGNATURE
// ============================================
console.log('%c C. SACHIN PORTFOLIO %c v4.0 ', 'background:linear-gradient(135deg,#00d4ff,#a855f7);color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;', 'background:#050a14;color:#00d4ff;padding:4px 8px;border-radius:0 4px 4px 0;font-family:monospace;');
console.log('%c Java Full Stack Developer | Backend: ' + API, 'color:#00f5d4;font-style:italic;');
