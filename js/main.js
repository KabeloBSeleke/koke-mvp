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

// ===== Basic Form Validation (mailto fallback) =====
const contactForm = document.getElementById('contact-form');

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
  if (input) {
    input.classList.add('border-red-500');
    input.setAttribute('aria-invalid', 'true');
  }
}

function clearError(fieldId) {
  const errorEl = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (input) {
    input.classList.remove('border-red-500');
    input.removeAttribute('aria-invalid');
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    let valid = true;

    clearError('name');
    clearError('email');
    clearError('message');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

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
      e.preventDefault();
      const firstError = contactForm.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
    }
  });
}

// ===== Active nav link highlighting =====
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('#navbar a[href^="#"]');

function highlightNav() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('text-primary');
        link.classList.add('text-gray-300');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('text-primary');
          link.classList.remove('text-gray-300');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);
window.addEventListener('load', highlightNav);

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

// ===== Number Counter Animation =====
const counterElements = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.getAttribute('data-count'), 10);
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        entry.target.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counterElements.forEach(el => counterObserver.observe(el));

// ===== Timeline Bar Fill Animation =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lifecycleSection = document.getElementById('lifecycle');

if (lifecycleSection) {
  const timelineBars = lifecycleSection.querySelectorAll('.timeline-bar, .gantt-bar');

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (prefersReducedMotion) {
          timelineBars.forEach(bar => bar.classList.add('animate'));
        } else {
          timelineBars.forEach((bar, index) => {
            setTimeout(() => {
              bar.classList.add('animate');
            }, index * 80);
          });
        }
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  timelineObserver.observe(lifecycleSection);
}

// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const themeToggleMobile = document.getElementById('theme-toggle-mobile');
const htmlEl = document.documentElement;

function setTheme(dark) {
  htmlEl.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  setTheme(!htmlEl.classList.contains('dark'));
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches);
  }
});
