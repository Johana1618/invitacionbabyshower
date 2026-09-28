# Ilustraciones — especificaciones para reemplazarlas

Cada ilustración es un **archivo independiente** en esta carpeta. La página las
carga con `<img src="assets/illustrations/nombre.svg">`, así que puedes
reemplazar cualquier archivo por tu propio dibujo **sin tocar código**: solo
respeta el nombre del archivo (o cambia el `src` en `index.html` si usas otro
nombre/extensión).

## Reglas generales (aplican a todas)

- **Formato:** SVG de preferencia (se ve nítido en cualquier tamaño y pesa
  poco). PNG también funciona si prefieres dibujar a mano/digital, pero
  expórtalo **al triple del tamaño mostrado en la página** (ver tabla) para
  que no se vea pixelado en pantallas de alta resolución, y con fondo
  transparente.
- **Fondo transparente.** Nada de textura de papel, marco ni sombra propia
  del archivo — el sitio ya pone su propio fondo detrás.
- **Composición centrada con margen:** deja un ~10% de aire alrededor del
  dibujo dentro del lienzo. Si el arte toca los bordes, se puede ver cortado
  al escalarlo.
- **Estilo:** línea fina y delicada (trazo de 2–3px a la escala final),
  colores pastel, rellenos suaves (no sólidos ni muy saturados). Evita
  detalles muy pequeños: en el sitio se muestran chiquitas (ver columna
  "tamaño mostrado").
- **Paleta del sitio** (para que combinen):
  - Rosa: `#ffc7bd` (claro) / `#e8837e` (contorno)
  - Azul cielo: `#7dc8ea` / `#4fa4c9`
  - Lavanda: `#c9b6dd` / `#a98fc4`
  - Amarillo sol: `#ffc94d` / `#e0a83a`
  - Durazno: `#f3c08c` / `#d99a56`
  - Menta: `#5fd1a3`
  - Contorno neutro (conejito/cochecito): `#c98a95`
  - Crema (rellenos claros): `#fbf3ec` / `#fffdf9`

## Lista de archivos

| Archivo | Qué es | Lienzo recomendado | Tamaño mostrado en la página |
|---|---|---|---|
| `cochecito.svg` | Cochecito de bebé con móvil colgante (luna, nube, estrella). Es la ilustración principal, arriba de la portada. | 440×400 px (proporción ~11:10) | ~104–136 px de ancho |
| `sol.svg` | Solecito sonriente | 200×200 px (cuadrado) | ~56–80 px |
| `mariposa-1.svg` | Mariposa (tono rosa) | 160×140 px | ~34 px |
| `mariposa-2.svg` | Mariposa (tono azul) | 160×140 px | ~34 px |
| `mariposa-3.svg` | Mariposa (tono lavanda) | 160×140 px | ~37 px |
| `flor-1.svg` | Flor pequeña (tono lavanda) | 120×120 px (cuadrado) | ~36 px |
| `flor-2.svg` | Flor pequeña (tono durazno) | 120×120 px (cuadrado) | ~28 px |
| `conejito.svg` | Conejito sentado, mismo estilo que el cochecito | 160×190 px | ~64 px |

Las tres mariposas y las dos flores pueden ser el mismo dibujo repetido en
otro color, o diseños distintos — lo único que importa es que cada archivo
tenga la proporción indicada para no verse estirado.

## Si quieres cambiar cuántas hay o dónde van

Si en vez de 3 mariposas quieres 2, o quieres agregar una ilustración nueva
(por ejemplo un chupete o una cigüeña), dime y ajusto el HTML/CSS — agregar o
quitar una etiqueta `<img>` es rápido. Lo que no cambia solo con reemplazar el
archivo es la **posición en la pantalla** (eso vive en `styles.css`, clases
como `.hero__sun`, `.butterfly--1`, etc.).
