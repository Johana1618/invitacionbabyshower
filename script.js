/* ==========================================================================
   CONFIGURACIÓN — edita estos valores
   ========================================================================== */
const CONFIG = {
  // Fecha y hora del evento (ISO 8601 con zona horaria; -05:00 = Colombia)
  eventDate: '2026-11-15T15:00:00-05:00',
  eventDurationHours: 4,
  eventTitle: 'Baby Shower de Nihan',

  // Dirección que se usa en el mapa, en "Abrir en Google Maps" y en el calendario
  mapQuery: 'San Carlos, Antioquia, Colombia',

  // Canción: ruta al archivo en assets/ (ej. 'assets/cancion.mp3').
  // Vacío = el botón de música no aparece.
  songSrc: '',

  // Endpoint del RSVP (Formspree, Getform, Google Apps Script, etc.).
  // Vacío = modo demostración: el formulario muestra éxito sin enviar nada.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbznwiKc5bQgfLfT7dxYwPPqWBaVHZrOO0Zy-yBkf6O49RErAJQgjv_pYFWiuIo8svW1Gg/exec',
};

/* ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Animaciones al hacer scroll ---------- */
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  const reveal = (el) => el.classList.add('is-visible');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(reveal);
    return;
  }

  // La portada se anima al cargar, no al hacer scroll
  const hero = document.querySelector('[data-animate="hero"]');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => reveal(hero)));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target); // solo una vez: no se repite al volver a scrollear
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  elements.forEach((el) => {
    if (el !== hero) observer.observe(el);
  });
}

/* ---------- Cuenta regresiva ---------- */
function initCountdown() {
  const target = new Date(CONFIG.eventDate).getTime();
  const nums = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]'),
  };
  const done = document.getElementById('countdownDone');
  if (Number.isNaN(target) || !nums.days) return;

  const pad = (n) => String(n).padStart(2, '0');
  let timer;

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    nums.days.textContent = Math.floor(s / 86400);
    nums.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    nums.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    nums.seconds.textContent = pad(s % 60);

    if (diff === 0) {
      clearInterval(timer);
      done.hidden = false;
    }
  };

  tick();
  timer = setInterval(tick, 1000);
}

/* ---------- Mapa y calendario ---------- */
function initLinks() {
  const q = encodeURIComponent(CONFIG.mapQuery);

  const frame = document.getElementById('mapFrame');
  if (frame) frame.src = `https://www.google.com/maps?q=${q}&output=embed`;

  const mapLink = document.getElementById('mapLink');
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${q}`;

  const calLink = document.getElementById('calendarLink');
  const start = new Date(CONFIG.eventDate);
  if (calLink && !Number.isNaN(start.getTime())) {
    const end = new Date(start.getTime() + CONFIG.eventDurationHours * 3600 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: CONFIG.eventTitle,
      dates: `${fmt(start)}/${fmt(end)}`,
      location: CONFIG.mapQuery,
    });
    calLink.href = `https://calendar.google.com/calendar/render?${params}`;
  }
}

/* ---------- Música ---------- */
function initMusic() {
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('song');
  if (!btn || !audio || !CONFIG.songSrc) return;

  btn.hidden = false;

  const setState = (playing) => {
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  };

  audio.addEventListener('error', () => { btn.hidden = true; });

  btn.addEventListener('click', () => {
    if (!audio.src) audio.src = CONFIG.songSrc; // se carga solo al primer toque
    if (audio.paused) {
      audio.play().then(() => setState(true)).catch(() => setState(false));
    } else {
      audio.pause();
      setState(false);
    }
  });
}

/* ---------- RSVP ---------- */
function initRsvp() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const nameInput = form.elements.nombre;
  const nameError = document.getElementById('nombre-error');
  const guestsField = document.getElementById('invitadosField');
  const submit = document.getElementById('rsvpSubmit');
  const formError = document.getElementById('rsvpError');
  const result = document.getElementById('rsvpResult');
  const resultTitle = document.getElementById('rsvpResultTitle');
  const resultText = document.getElementById('rsvpResultText');
  const sectionTitle = document.getElementById('rsvp-titulo');

  // Ocultar "número de personas" si no asistirá
  form.querySelectorAll('input[name="asistencia"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      guestsField.hidden = form.elements.asistencia.value === 'no';
    });
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) {
      nameInput.removeAttribute('aria-invalid');
      nameError.textContent = '';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formError.textContent = '';

    if (!nameInput.value.trim()) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.setAttribute('aria-describedby', 'nombre-error');
      nameError.textContent = 'Por favor escribe tu nombre.';
      nameInput.focus();
      return;
    }

    const data = new FormData(form);
    if (data.get('_gotcha')) return; // bot

    submit.disabled = true;

    const attending = data.get('asistencia') === 'si';

    try {
      if (CONFIG.rsvpEndpoint) {
        // Google Apps Script no deja leer la respuesta desde el navegador
        // (CORS), así que se envía en modo "no-cors": si el navegador no
        // lanza un error de red, asumimos que Apps Script recibió los datos.
        await fetch(CONFIG.rsvpEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: data,
        });
      } else {
        await new Promise((r) => setTimeout(r, 500)); // modo demostración
      }

      // Alegre y animado si va a venir; sencillo y tranquilo si no
      if (attending) {
        resultTitle.textContent = '¡Nos vemos allá!';
        resultText.textContent = 'Gracias por confirmar tu asistencia 🤍';
        result.className = 'rsvp-result is-yes';
      } else {
        resultTitle.textContent = 'Gracias por avisarnos';
        resultText.textContent = 'Te vamos a extrañar ese día.';
        result.className = 'rsvp-result is-no';
      }

      form.style.display = 'none';
      if (sectionTitle) sectionTitle.style.display = 'none';
      result.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        result.classList.add('is-visible');
      }));
    } catch {
      formError.textContent = 'No pudimos enviar tu confirmación. Inténtalo de nuevo en un momento.';
    } finally {
      submit.disabled = false;
    }
  });
}

/* ---------- Inicio ---------- */
initAnimations();
initCountdown();
initLinks();
initMusic();
initRsvp();
