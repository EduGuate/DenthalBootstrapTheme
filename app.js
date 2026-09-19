'use strict';
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menú');
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav.classList.toggle('open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('pending');
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(element => {
  if (!motion.matches) { element.classList.add('pending'); revealObserver.observe(element); }
});
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) nav.querySelectorAll('a').forEach(link => {
      const active = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-20% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

const scrollImages = [...document.querySelectorAll('.scroll-image')];
const progress = document.querySelector('.scroll-progress');
let framePending = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  if (!motion.matches) scrollImages.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const amount = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      element.style.setProperty('--image-scale', (1 + amount * .15).toFixed(3));
    }
  });
  framePending = false;
}
function requestScroll() { if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); } }
window.addEventListener('scroll', requestScroll, { passive: true });
window.addEventListener('resize', requestScroll);
motion.addEventListener('change', () => {
  if (motion.matches) document.querySelectorAll('.reveal.pending').forEach(element => element.classList.remove('pending'));
  requestScroll();
});

const dialogs = [...document.querySelectorAll('dialog')];
let returnFocus = null;
function openDialog(dialog, trigger) {
  const previous = dialogs.find(item => item.open);
  if (previous) previous.close();
  returnFocus = trigger.closest('dialog') ? returnFocus : trigger;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
dialogs.forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!dialogs.some(item => item.open)) {
      document.body.classList.remove('modal-open');
      returnFocus?.focus({ preventScroll: true });
    }
  });
});
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  const image = document.querySelector('#expanded-image');
  image.src = button.dataset.image;
  image.alt = button.dataset.caption;
  document.querySelector('#image-caption').textContent = button.dataset.caption;
  openDialog(document.querySelector('#image-dialog'), button);
}));
const treatments = {
  general: { name: 'Odontología general', description: 'El cuidado cotidiano de tu sonrisa comienza con una valoración personal. Explora revisiones, limpieza y restauraciones con un profesional que escuche tus necesidades y te explique cada paso.' },
  aesthetic: { name: 'Estética dental', description: 'Cada sonrisa tiene su propia identidad. Una consulta permite conversar sobre tus objetivos, conocer opciones de blanqueamiento y carillas, y valorar qué alternativas se ajustan a tu caso.' },
  orthodontics: { name: 'Ortodoncia', description: 'Conoce las opciones para la alineación dental. Durante una valoración, el profesional puede explicarte las alternativas de brackets y alineadores, así como el seguimiento de un plan personalizado.' }
};
const team = {
  john: { name: 'Dr. John Smith', description: 'Director clínico · Odontología general. Perfil de ejemplo para mostrar al equipo de tu clínica. Sustituye este contenido por la trayectoria, formación y fotografía autorizada de tu profesional.' },
  emily: { name: 'Dra. Emily Johnson', description: 'Especialista en ortodoncia. Perfil de ejemplo para mostrar al equipo de tu clínica. Sustituye este contenido por la trayectoria, formación y fotografía autorizada de tu profesional.' },
  michael: { name: 'Dr. Michael Lee', description: 'Especialista en estética dental. Perfil de ejemplo para mostrar al equipo de tu clínica. Sustituye este contenido por la trayectoria, formación y fotografía autorizada de tu profesional.' }
};
function showInfo(item, label, trigger) {
  document.querySelector('#info-label').textContent = label;
  document.querySelector('#info-title').textContent = item.name;
  document.querySelector('#info-copy').textContent = item.description;
  openDialog(document.querySelector('#info-dialog'), trigger);
}
document.querySelectorAll('[data-treatment]').forEach(button => button.addEventListener('click', () => {
  const item = treatments[button.dataset.treatment];
  document.querySelector('#treatment').value = item.name;
  showInfo(item, 'CUIDADO A TU MEDIDA', button);
}));
document.querySelectorAll('[data-team]').forEach(button => button.addEventListener('click', () => showInfo(team[button.dataset.team], 'CONOCE AL EQUIPO · DEMO', button)));
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => openDialog(document.querySelector('#booking-dialog'), button)));
const dateInput = document.querySelector('#visit-date');
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
document.querySelector('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#visitor-name').value.trim();
  if (!name) { document.querySelector('#visitor-name').setCustomValidity('Escribe tu nombre.'); document.querySelector('#visitor-name').reportValidity(); return; }
  const date = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  const result = document.querySelector('#booking-result');
  result.textContent = `${name}, este es el resumen de tu visita de ejemplo: ${document.querySelector('#treatment').value}, el ${date}. Es una demostración: no se ha reservado ni enviado ninguna cita.`;
  result.hidden = false;
});
document.querySelector('#visitor-name').addEventListener('input', event => event.target.setCustomValidity(''));
document.querySelector('#booking-form').addEventListener('input', () => { document.querySelector('#booking-result').hidden = true; });

const quotes = [
  { text: 'La mejor experiencia dental que he tenido. El equipo es amable, profesional y te hace sentir en confianza desde el primer momento.', author: 'Sarah M.', initials: 'SM' },
  { text: 'Estoy muy feliz con mi nueva sonrisa. Gracias, Smile Bright Dental, por acompañarme en cada paso del camino.', author: 'James L.', initials: 'JL' }
];
let quoteIndex = 0;
function changeQuote(direction) {
  quoteIndex = (quoteIndex + direction + quotes.length) % quotes.length;
  const quote = quotes[quoteIndex];
  document.querySelector('#quote-text').textContent = quote.text;
  document.querySelector('#quote-author').textContent = quote.author;
  document.querySelector('#quote-avatar').textContent = quote.initials;
  document.querySelector('#quote-index').textContent = `0${quoteIndex + 1} / 02`;
  if (!motion.matches) document.querySelector('.quote-card').animate([{ opacity: .15, transform: 'translateX(12px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 400, easing: 'ease-out' });
}
document.querySelector('#quote-prev').addEventListener('click', () => changeQuote(-1));
document.querySelector('#quote-next').addEventListener('click', () => changeQuote(1));
document.querySelector('#year').textContent = new Date().getFullYear();
updateScroll();
