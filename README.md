# Invitación Baby Shower — Nihan

Sitio estático (HTML + CSS + JS, sin dependencias).

```
index.html
styles.css
script.js
assets/   ← fotos y audio
```

Para verlo en local, abre `index.html` en el navegador, o sirve la carpeta con `npx serve .`.

## Cambiar textos, fecha y lugar

- **Textos** (nombres, fecha visible, lugar, regalo): edítalos directamente en `index.html`.
- **Fecha de la cuenta regresiva, dirección del mapa y calendario**: al inicio de `script.js`, en el objeto `CONFIG`:

```js
eventDate: '2026-11-15T15:00:00-05:00', // -05:00 = hora de Colombia
mapQuery: 'Salón Jardín Las Flores, Medellín',
```

## Reemplazar la foto

1. Copia tu foto en `assets/` (por ejemplo `assets/foto-padres.jpg`). Formato vertical 4:5, de unos 1200×1500 px y menos de 400 KB.
2. En `index.html`, cambia `src="assets/foto-padres.svg"` por `src="assets/foto-padres.jpg"` y ajusta el `alt`.

## Agregar la canción

1. Copia el archivo en `assets/` (por ejemplo `assets/cancion.mp3`). Usa MP3 para que funcione en Safari iOS y Chrome Android.
2. En `script.js`, pon `songSrc: 'assets/cancion.mp3'`.

El botón de música aparece abajo a la derecha. Los navegadores móviles no permiten reproducir audio automáticamente, así que la canción empieza cuando el invitado toca el botón.

## Conectar el RSVP

Mientras `rsvpEndpoint` esté vacío, el formulario funciona en **modo demostración** (muestra el mensaje de éxito, pero no envía nada).

Con **Formspree** (gratis):
1. Crea un formulario en <https://formspree.io> y copia su URL (`https://formspree.io/f/xxxxxxx`).
2. En `script.js`: `rsvpEndpoint: 'https://formspree.io/f/xxxxxxx'`.

Cualquier servicio que acepte `POST` con `FormData` sirve igual (Getform, Basin, Google Apps Script…). Los campos que se envían son `nombre`, `asistencia` (`si`/`no`), `invitados` y `mensaje`.

## Desplegar en Vercel

Con la CLI:

```bash
npm i -g vercel
vercel          # primera vez: vista previa y configuración del proyecto
vercel --prod   # publicar en producción
```

Desde la web: sube la carpeta a un repositorio de GitHub, entra a <https://vercel.com/new>, importa el repo y dale **Deploy**. Como es un sitio estático, no hace falta configurar build ni carpeta de salida.
