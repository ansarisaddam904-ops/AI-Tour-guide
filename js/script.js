// ===================================================
// SunSpark Solar Care — Site Script
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('active', isOpen);
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav a');

  const setActiveLink = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Back to top button ---------- */
  const backToTop = document.getElementById('backToTop');
  const toggleBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  /* ---------- Scroll reveal animation ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Pricing category tabs ---------- */
  const pricingTabs = document.querySelectorAll('.pricing-tab');
  const pricingPanels = document.querySelectorAll('.pricing-panel');

  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      pricingTabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      pricingPanels.forEach(panel => {
        const isTarget = panel.id === target;
        panel.classList.toggle('active', isTarget);
        panel.hidden = !isTarget;
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      accordionItems.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    const validators = {
      name: value => value.trim().length >= 2,
      phone: value => /^[+()\-.\s\d]{7,}$/.test(value.trim()),
      email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      address: value => value.trim().length >= 5,
    };

    const validateField = (field) => {
      const group = field.closest('.form-group');
      const validator = validators[field.name];
      if (!validator) return true;

      const valid = validator(field.value);
      group.classList.toggle('invalid', !valid);
      return valid;
    };

    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          if (field.closest('.form-group').classList.contains('invalid')) {
            validateField(field);
          }
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (field && !validateField(field)) isValid = false;
      });

      if (!isValid) {
        const firstInvalid = form.querySelector('.form-group.invalid input, .form-group.invalid select');
        if (firstInvalid) firstInvalid.focus();
        successMsg.classList.remove('show');
        return;
      }

      // No backend is wired up yet — this simulates a successful submission.
      // Replace with a fetch() call to your form endpoint / API when ready.
      successMsg.classList.add('show');
      form.reset();

      setTimeout(() => {
        successMsg.classList.remove('show');
      }, 6000);
    });
  }

});
