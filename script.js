/* ==========================================================================
   CONFIGURACIÓN — edita estos valores
   ========================================================================== */
const CONFIG = {
  // Fecha y hora del evento (ISO 8601 con zona horaria; -05:00 = Colombia)
  eventDate: '2026-11-15T15:00:00-05:00',
  eventDurationHours: 4,
  eventTitle: 'Baby Shower de Nihan',

  // Punto exacto (latitud, longitud) para el mapa y "Abrir en Google Maps"
  mapQuery: '6.165645,-75.032913',
  // Dirección legible que se pone como lugar en "Agregar al calendario"
  placeName: 'Finca Guadalupe, Vereda Dos Quebradas, San Carlos, Antioquia',

  // Canción: ruta al archivo en assets/ (ej. 'assets/cancion.mp3').
  // Vacío = el botón de música no aparece.
  songSrc: 'assets/a-thousand-years-2.mp3',
  // Segundo en que termina la intro instrumental: al llegar ahí la canción
  // vuelve al inicio (así no suena la parte con letra). 0 = suena completa.
  songIntroEnd: 0,

  // Endpoint del RSVP (Formspree, Getform, Google Apps Script, etc.).
  // Vacío = modo demostración: el formulario muestra éxito sin enviar nada.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycby71Bvloh0YIR3utLfopuvbDpdKx6-bC-jTi5ZxAXtKocSa7defruCRCi6-CqJ0bhRS/exec',
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

  // La portada se anima al cargar (o al abrir el sobre), no al hacer scroll
  const hero = document.querySelector('[data-animate="hero"]');
  const revealHero = () => requestAnimationFrame(() => requestAnimationFrame(() => reveal(hero)));
  if (hero && document.getElementById('envelope')) {
    document.addEventListener('invitacion-abierta', revealHero, { once: true });
  } else if (hero) {
    revealHero();
  }

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
  if (frame) frame.src = `https://www.google.com/maps?q=${q}&z=17&output=embed`;

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
      location: `${CONFIG.placeName} (${CONFIG.mapQuery})`,
    });
    calLink.href = `https://calendar.google.com/calendar/render?${params}`;
  }
}

/* ---------- Música ----------
   Devuelve una función que empieza la canción (la usa el sobre de bienvenida). */
function initMusic() {
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('song');
  if (!btn || !audio || !CONFIG.songSrc) return () => {};

  btn.hidden = false;

  // Se descarga mientras se ve el sobre, para que suene apenas se abra
  audio.src = CONFIG.songSrc;
  audio.preload = 'auto';
  audio.load();

  const setState = (playing) => {
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  };

  const play = () => {
    audio.play().then(() => setState(true)).catch(() => setState(false));
  };

  audio.addEventListener('error', () => { btn.hidden = true; });

  // Solo la intro: un poco antes del final configurado, vuelve al inicio
  if (CONFIG.songIntroEnd > 0) {
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= CONFIG.songIntroEnd - 0.25) audio.currentTime = 0;
    });
  }

  // Si la persona sale del navegador o cambia de pestaña, la música se pausa;
  // al volver sigue sonando (solo si estaba sonando antes de salir)
  let pausedByLeaving = false;
  const leave = () => {
    if (audio.paused) return;
    audio.pause();
    setState(false);
    pausedByLeaving = true;
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      leave();
    } else if (pausedByLeaving) {
      pausedByLeaving = false;
      play();
    }
  });
  window.addEventListener('pagehide', leave);

  btn.addEventListener('click', () => {
    pausedByLeaving = false;
    if (audio.paused) {
      play();
    } else {
      audio.pause();
      setState(false);
    }
  });

  return play;
}

/* ---------- Sobre de bienvenida ----------
   Al tocar el corazón: suena la música (tiene que ser dentro del toque, si no
   el celular la bloquea), se abre la solapa, sube la tarjeta y el sobre se
   desvanece para mostrar la invitación. */
function initEnvelope(playMusic) {
  const envelope = document.getElementById('envelope');
  const seal = document.getElementById('envelopeSeal');
  const root = document.documentElement;
  if (!envelope || !seal) {
    root.classList.remove('has-envelope');
    return;
  }

  // Tiempos alineados con las transiciones de styles.css
  const revealAt = prefersReducedMotion ? 0 : 1600;
  const removeAt = prefersReducedMotion ? 300 : 2100;

  if (!prefersReducedMotion) buildSmoke();

  seal.addEventListener('click', () => {
    playMusic();
    envelope.classList.add('is-opening');
    seal.disabled = true;

    setTimeout(() => {
      window.scrollTo(0, 0);
      root.classList.remove('has-envelope');
      document.dispatchEvent(new Event('invitacion-abierta'));
    }, revealAt);

    setTimeout(() => envelope.remove(), removeAt);
  }, { once: true });
}

/* Humo del sobre: nubecitas difuminadas que rebosan el bolsillo y suben en
   un remolino (espiral que se abre hacia arriba), con destellos y
   estrellitas repartidos por el remolino. Posiciones en rem desde la boca
   del sobre. */
function buildSmoke() {
  const smoke = document.getElementById('envelopeSmoke');
  const sparkles = document.getElementById('envelopeSparkles');
  if (!smoke || !sparkles) return;

  // Aleatorio fijo, para que el remolino se vea igual cada vez
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const add = (parent, className, vars) => {
    const el = document.createElement('span');
    el.className = className;
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(`--${k}`, v));
    parent.appendChild(el);
    return el;
  };

  // Espiral: t = 0 en la boca del sobre, t = 1 arriba. Da casi dos vueltas,
  // se va abriendo y subiendo; aplanada para que parezca un torbellino
  const onSpiral = (t, jitter = 0) => {
    const a = ((90 + t * 620) * Math.PI) / 180;
    const r = 1.5 + t * 7 + jitter;
    return {
      x: Math.cos(a) * r,
      y: -1 - t * 11 + Math.sin(a) * r * 0.45,
    };
  };

  // Nubes que rebosan el bolsillo
  for (let i = 0; i < 7; i++) {
    add(smoke, 'smoke-puff', {
      x: `${-7.5 + i * 2.5}rem`,
      y: `${1 + rand() * 1.5}rem`,
      s: (2.2 + rand() * 0.8).toFixed(2),
      d: `${Math.round(rand() * 250)}ms`,
    });
  }

  // Nubes del remolino, de abajo hacia arriba
  const steps = 32;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const count = 1 + Math.round(rand());
    for (let k = 0; k < count; k++) {
      const p = onSpiral(t + (rand() - 0.5) * 0.02, (rand() - 0.5) * 1.6);
      add(smoke, 'smoke-puff', {
        x: `${p.x.toFixed(2)}rem`,
        y: `${p.y.toFixed(2)}rem`,
        s: (1.2 + t * 0.8 + rand() * 0.6).toFixed(2),
        d: `${Math.round(150 + t * 900 + rand() * 100)}ms`,
      });
    }
  }

  // Destellos y estrellitas por el remolino y sobre la boca del sobre
  for (let i = 0; i < 60; i++) {
    const t = rand();
    const p = i < 50
      ? onSpiral(t, (rand() - 0.5) * 3)
      : { x: (rand() - 0.5) * 14, y: rand() * 2 - 1 };
    const isStar = i % 3 === 0;
    const el = add(sparkles, isStar ? 'smoke-star' : 'smoke-sparkle', {
      x: `${p.x.toFixed(2)}rem`,
      y: `${p.y.toFixed(2)}rem`,
      z: `${((isStar ? 1.1 : 0.7) + rand() * (isStar ? 0.7 : 1.1)).toFixed(2)}rem`,
      d: `${Math.round(t * 900 + rand() * 300)}ms`,
    });
    if (isStar) el.textContent = '★';
  }
}

/* ---------- RSVP ---------- */
function initRsvp() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const nameInput = form.elements.nombre;
  const nameError = document.getElementById('nombre-error');
  const submit = document.getElementById('rsvpSubmit');
  const formError = document.getElementById('rsvpError');
  const result = document.getElementById('rsvpResult');
  const resultTitle = document.getElementById('rsvpResultTitle');
  const resultText = document.getElementById('rsvpResultText');
  const sectionTitle = document.getElementById('rsvp-titulo');

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

    // El mensaje sale al instante y el envío sigue en segundo plano: Apps
    // Script tarda varios segundos en responder. "keepalive" hace que el
    // envío termine aunque la persona cierre la página.
    showResult(attending);

    try {
      if (CONFIG.rsvpEndpoint) {
        // Google Apps Script no deja leer la respuesta desde el navegador
        // (CORS), así que se envía en modo "no-cors": si el navegador no
        // lanza un error de red, asumimos que Apps Script recibió los datos.
        await fetch(CONFIG.rsvpEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          body: data,
        });
      }
    } catch {
      // Falló la conexión: se vuelve al formulario para intentarlo de nuevo
      hideResult();
      formError.textContent = 'No pudimos enviar tu confirmación. Revisa tu conexión e inténtalo de nuevo.';
    } finally {
      submit.disabled = false;
    }
  });

  // "Gracias por ser parte de este momento" solo aparece al confirmar que
  // sí viene; si no viene, no se muestra (y tampoco el "Te esperamos")
  const thanks = document.getElementById('rsvpResultThanks');
  const notComingHidden = ['rsvpEyebrow', 'rsvpDivider'].map((id) => document.getElementById(id)).filter(Boolean);

  function showResult(attending) {
    // Alegre y animado si va a venir; sencillo y tranquilo si no
    resultTitle.textContent = attending ? '' : 'Gracias por avisarnos';
    resultText.textContent = '';
    result.className = attending ? 'rsvp-result is-yes' : 'rsvp-result is-no';

    form.style.display = 'none';
    if (sectionTitle) sectionTitle.style.display = 'none';
    if (thanks) thanks.hidden = !attending;
    notComingHidden.forEach((el) => { el.style.display = attending ? '' : 'none'; });

    result.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      result.classList.add('is-visible');
    }));
  }

  function hideResult() {
    result.hidden = true;
    result.classList.remove('is-visible');
    form.style.display = '';
    if (sectionTitle) sectionTitle.style.display = '';
    notComingHidden.forEach((el) => { el.style.display = ''; });
  }
}

/* ---------- Inicio ---------- */
initAnimations();
initCountdown();
initLinks();
initEnvelope(initMusic());
initRsvp();
