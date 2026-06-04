// ============================================================
// Vuka Construction — Interactive Behaviours
// ============================================================

// ---- Scroll progress bar ----
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const pct = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}

// ---- Sticky header + back-to-top ----
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  scrollProgress && updateScrollProgress();
  header.classList.toggle('scrolled', y > 60);
  backToTop && backToTop.classList.toggle('visible', y > 400);
}, { passive: true });

backToTop?.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

// ---- Mobile hamburger ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('mainNav');
hamburger?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.classList.toggle('active', open);
});
nav?.querySelectorAll('.nav-link').forEach(l =>
  l.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
  })
);

// ---- Active nav highlight on scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe
  ? sections.forEach(s => {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' }).observe(s);
    })
  : null;

// ---- Animated counters ----
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const tick = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ---- Scroll reveal (staggered) ----
const revealItems = document.querySelectorAll(
  '.service-card, .trust-card, .project-card, .credential-block, .channel, .pillar, .testi-slide'
);
revealItems.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity .55s ease ${(i % 4) * 80}ms, transform .55s ease ${(i % 4) * 80}ms`;
});
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { rootMargin: '0px 0px -50px 0px' })
  .observe
  ? revealItems.forEach(el => {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        });
      }, { rootMargin: '0px 0px -50px 0px' }).observe(el);
    })
  : null;

// ---- Project lightbox ----
const overlay   = document.getElementById('lightboxOverlay');
const lbClose   = document.getElementById('lightboxClose');
const lbImg     = document.getElementById('lightboxImg');
const lbCat     = document.getElementById('lightboxCat');
const lbTitle   = document.getElementById('lightboxTitle');
const lbDesc    = document.getElementById('lightboxDesc');
const lbMeta    = document.getElementById('lightboxMeta');
const lbCta     = document.getElementById('lightboxCta');

function openLightbox(card) {
  lbImg.style.backgroundImage = `url('${card.dataset.bg}')`;
  lbCat.textContent   = card.dataset.cat;
  lbTitle.textContent = card.dataset.title;
  lbDesc.textContent  = card.dataset.desc;
  lbMeta.innerHTML    = card.dataset.meta
    .split('|')
    .map(m => `<span>${m.trim()}</span>`)
    .join('');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.open-lightbox').forEach(card => {
  card.addEventListener('click', () => openLightbox(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(card); }
  });
});

lbClose?.addEventListener('click', closeLightbox);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
lbCta?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ---- Testimonials slider ----
const track  = document.getElementById('testiTrack');
const dotsWrap = document.getElementById('testiDots');
const prevBtn  = document.querySelector('.testi-prev');
const nextBtn  = document.querySelector('.testi-next');

if (track) {
  const slides = track.querySelectorAll('.testi-slide');
  let current = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.testi-dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  resetAuto();
}

// ---- Smooth anchor scroll (with offset for sticky header) ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 88;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

// ---- Contact form — real-time validation + submit ----
const form = document.getElementById('contactForm');
if (form) {
  const showError = (input, msg) => {
    let err = input.parentNode.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; input.parentNode.appendChild(err); }
    err.textContent = msg;
    input.classList.add('invalid');
  };
  const clearError = input => {
    const err = input.parentNode.querySelector('.field-error');
    if (err) err.remove();
    input.classList.remove('invalid');
  };

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        showError(field, 'This field is required.');
      } else if (field.type === 'email' && field.value && !/\S+@\S+\.\S+/.test(field.value)) {
        showError(field, 'Enter a valid email address.');
      } else if (field.type === 'tel' && field.value && !/^[0-9\s+\-()]{7,15}$/.test(field.value)) {
        showError(field, 'Enter a valid phone number.');
      } else {
        clearError(field);
      }
    });
    field.addEventListener('input', () => { if (field.classList.contains('invalid')) clearError(field); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) { showError(field, 'This field is required.'); valid = false; }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Replace with real backend / Formspree / EmailJS in production
    setTimeout(() => {
      btn.textContent = '✓ Request Sent — We Will Contact You Within 24 Hours';
      btn.style.background = '#059669';
      form.reset();
      setTimeout(() => { btn.textContent = 'Submit Quote Request'; btn.disabled = false; btn.style.background = ''; }, 6000);
    }, 1400);
  });
}
