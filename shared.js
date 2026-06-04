// ============================================================
// Vuka Construction — Shared interactive behaviours (all pages)
// ============================================================

export function initShared() {
  // ---- Scroll progress bar ----
  const progressBar = document.getElementById('scrollProgress');
  const header      = document.getElementById('header');
  const backToTop   = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = max > 0 ? (y / max * 100) + '%' : '0%';
    }
    header?.classList.toggle('scrolled', y > 60);
    backToTop?.classList.toggle('visible', y > 400);
  }, { passive: true });

  backToTop?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  // ---- Mobile hamburger ----
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('mainNav');
  hamburger?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.classList.toggle('active', open);
  });
  nav?.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger?.classList.remove('active');
    })
  );

  // ---- Smooth anchor scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' });
      }
    });
  });

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll(
    '.service-card, .trust-card, .project-card, .credential-block, .channel, .pillar, .process-step, .faq-item, .value-card, .equip-card, .area-card, .step-box'
  );
  revealEls.forEach((el, i) => {
    el.style.cssText += `opacity:0;transform:translateY(26px);transition:opacity .5s ease ${(i % 4) * 70}ms,transform .5s ease ${(i % 4) * 70}ms`;
    new IntersectionObserver(([entry], obs) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.unobserve(el);
      }
    }, { rootMargin: '0px 0px -40px 0px' }).observe(el);
  });

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-q');
    const body    = item.querySelector('.faq-a');
    trigger?.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  // ---- Active nav highlight (page-based) ----
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    const href = l.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      l.classList.add('active');
    }
  });
}

// ---- Animated counter ----
export function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---- Project lightbox (shared) ----
export function initLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  if (!overlay) return;
  const lbClose = document.getElementById('lightboxClose');
  const lbImg   = document.getElementById('lightboxImg');
  const lbCat   = document.getElementById('lightboxCat');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbDesc  = document.getElementById('lightboxDesc');
  const lbMeta  = document.getElementById('lightboxMeta');
  const lbCta   = document.getElementById('lightboxCta');

  const open = card => {
    lbImg.style.backgroundImage = `url('${card.dataset.bg}')`;
    lbCat.textContent   = card.dataset.cat;
    lbTitle.textContent = card.dataset.title;
    lbDesc.textContent  = card.dataset.desc;
    lbMeta.innerHTML    = card.dataset.meta.split('|').map(m => `<span>${m.trim()}</span>`).join('');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose?.focus();
  };
  const close = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };

  document.querySelectorAll('.open-lightbox').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); } });
  });
  lbClose?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  lbCta?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ---- Contact form validation ----
export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const showErr = (f, msg) => {
    clearErr(f);
    const e = document.createElement('span');
    e.className = 'field-error'; e.textContent = msg;
    f.parentNode.appendChild(e);
    f.classList.add('invalid');
  };
  const clearErr = f => {
    f.parentNode.querySelector('.field-error')?.remove();
    f.classList.remove('invalid');
  };

  form.querySelectorAll('input, select, textarea').forEach(f => {
    f.addEventListener('blur', () => {
      if (f.required && !f.value.trim()) showErr(f, 'This field is required.');
      else if (f.type === 'email' && f.value && !/\S+@\S+\.\S+/.test(f.value)) showErr(f, 'Enter a valid email address.');
      else if (f.type === 'tel' && f.value && !/^[0-9\s+\-()]{7,15}$/.test(f.value)) showErr(f, 'Enter a valid phone number.');
      else clearErr(f);
    });
    f.addEventListener('input', () => { if (f.classList.contains('invalid')) clearErr(f); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => { if (!f.value.trim()) { showErr(f, 'This field is required.'); valid = false; } });
    if (!valid) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Request Sent — We\'ll be in touch within 24 hours';
      btn.style.background = '#059669';
      form.reset();
      setTimeout(() => { btn.textContent = 'Submit Quote Request'; btn.disabled = false; btn.style.background = ''; }, 6000);
    }, 1400);
  });
}
