// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');

if (menuToggle && mobileMenu && hamburgerIcon && closeIcon) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    hamburgerIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      menuToggle.focus();
    }
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    });
  });
}

// ===== Navbar background on scroll =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('shadow-lg', 'bg-secondary/95', 'backdrop-blur-sm');
    } else {
      navbar.classList.remove('shadow-lg', 'bg-secondary/95', 'backdrop-blur-sm');
    }
  });
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
