// ===== Mobile menu =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');

function setMenu(open) {
  mobileMenu.classList.toggle('hidden', !open);
  hamburgerIcon.classList.toggle('hidden', open);
  closeIcon.classList.toggle('hidden', !open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('overflow-hidden', open);
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.contains('hidden');
    setMenu(open);
    if (open) mobileMenu.querySelector('a').focus();
  });
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      setMenu(false);
      menuToggle.focus();
    }
  });
}

// ===== Header hairline once the page scrolls =====
const siteHeader = document.getElementById('site-header');
if (siteHeader) {
  const onScroll = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ===== Contact form (validation + mailto hand-off) =====
const contactForm = document.getElementById('contact-form');

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  input.classList.add('border-red-500');
  input.setAttribute('aria-invalid', 'true');
}

function clearError(fieldId) {
  const errorEl = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
  input.classList.remove('border-red-500');
  input.removeAttribute('aria-invalid');
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    ['name', 'email', 'message'].forEach(clearError);

    const name = contactForm.elements.name.value.trim();
    const email = contactForm.elements.email.value.trim();
    const topic = contactForm.elements.topic.value;
    const message = contactForm.elements.message.value.trim();
    let valid = true;

    if (!name) {
      showError('name', 'Please enter your name.');
      valid = false;
    }
    if (!email) {
      showError('email', 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!message) {
      showError('message', 'Please enter a message.');
      valid = false;
    }

    if (!valid) {
      contactForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    // No backend: hand the enquiry to the visitor's email app.
    const to = contactForm.getAttribute('action').replace(/^mailto:/, '');
    const subject = `Website enquiry: ${topic}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const status = document.getElementById('form-status');
    if (status) status.classList.remove('hidden');
  });
}

// ===== Scroll Reveal (IntersectionObserver) =====
const revealElements = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

function syncToggle() {
  if (!themeToggle) return;
  const dark = htmlEl.classList.contains('dark');
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

function setTheme(dark) {
  htmlEl.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  syncToggle();
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => setTheme(!htmlEl.classList.contains('dark')));
  syncToggle();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    htmlEl.classList.toggle('dark', e.matches);
    syncToggle();
  }
});

// ===== Gentle parallax on full-bleed image bands =====
const parallaxImages = document.querySelectorAll('[data-parallax]');
if (parallaxImages.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const update = () => {
    parallaxImages.forEach((img) => {
      const band = img.parentElement.getBoundingClientRect();
      if (band.bottom < 0 || band.top > window.innerHeight) return;
      const progress = (window.innerHeight - band.top) / (window.innerHeight + band.height);
      img.style.transform = `translate3d(0, ${-progress * (img.offsetHeight - band.height)}px, 0)`;
    });
  };
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  update();
}
