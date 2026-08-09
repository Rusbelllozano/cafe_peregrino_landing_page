# Rediseño del Hero y limpieza de combos — Diseño

**Fecha:** 2026-08-09
**Estado:** Aprobado, pendiente de plan de implementación

## Contexto

El landing actual abre con una foto de fondo de montaña + texto centrado, y separa
el detalle de productos en una sección aparte (`Products`) más abajo. Hay además una
sección final (`CTA`) dedicada por completo al "Combo Peregrino" (2 cafés en un solo
pack), que ya no se vende.

Objetivo: que lo primero que se vea sea el café mismo, listo para comprar, y quitar
toda mención a combos.

## Fuera de alcance

- No se toca el pricing real ni el número de WhatsApp (`src/lib/whatsapp.ts`).
- No se agregan dependencias nuevas (sin librerías de UI, sin canvas/WebGL).
- La página `src/app/promo/page.tsx` no se toca.
- Nuevas fotos para la secuencia de "Nuestra Historia" (más allá de las 4 iniciales)
  quedan para una iteración futura del usuario — el diseño solo debe dejarlo fácil
  de extender.

## 1. Hero rediseñado

### 1.1 Layout

`Hero.tsx` deja de mostrar una imagen de fondo de paisaje. Nueva estructura:

- Fondo sólido con los tokens de marca (navy/cream), sin `next/image` de fondo.
- Encabezado compacto arriba: nombre de marca + línea de origen (breve, ya no el
  headline gigante `--fs-hero` centrado).
- Badge de urgencia ("Lote Limitado · Primera Edición") sobre las columnas.
- **Dos columnas** (`grid`, 1 columna en mobile) — una por producto (Excelso,
  Premium), cada una con:
  - Foto de producto (`cafe_excelso.png` / `cafe_premium.png`, ya son verticales
    843×1264).
  - Nombre + tagline del producto.
  - Botón primario `.cta-button` → **"Pedir por WhatsApp"**. Mensaje distinto por
    producto vía `buildWhatsAppLink`:
    - Excelso: `"Hola, quiero pedir el Café Peregrino Excelso"`
    - Premium: `"Hola, quiero pedir el Café Peregrino Premium"`
    - Evento GA: `sendGAEvent('event', 'whatsapp_redirection', { value: 'hero-excelso' | 'hero-premium' })`.
  - Link secundario **"Ver detalles"** que abre el modal de ese producto
    (ver sección 2).
- Los datos de producto (nombre, tagline, notas, specs, imagen, accent) se
  centralizan en `src/components/Hero/products.ts`, un array `products` importado
  tanto por `Hero.tsx` como por `ProductModal.tsx` — hoy ese array vive solo en
  `Products.tsx`, que se elimina (sección 4).
- Las animaciones de entrada (`hero-anim`, fade/stagger) se mantienen sobre los
  nuevos elementos.

### 1.2 Onda interactiva de fondo

- Nuevo efecto: al mover el mouse sobre el fondo del Hero aparecen **anillos que
  se expanden y desvanecen** (ripple) en colores de marca. Los ripples alternan
  entre `--magenta` y `--orange` en el orden en que se generan (el primero
  magenta, el segundo naranja, y así sucesivamente) — no dependen de sobre qué
  columna esté el cursor, para mantener la lógica simple.
- Implementación sin dependencias nuevas:
  - Listener de `mousemove` sobre la sección, con throttle (~120ms) para no
    generar un ripple por cada evento.
  - Cada ripple es un elemento posicionado en `(x, y)` del cursor (coordenadas
    relativas a la sección), con una animación CSS `@keyframes` de
    `scale(0 → ~4)` + `opacity(0.5 → 0)` (~900ms).
  - Se guarda en un `useState<Ripple[]>` (id, x, y); cada ripple se remueve del
    array `onAnimationEnd` para no acumular nodos en el DOM.
- Activo únicamente bajo `@media (hover: hover) and (pointer: fine)`. En touch no
  se registra ningún listener — nada que desactivar en runtime, la condición vive
  en CSS/JS de forma que el efecto simplemente no se monta en dispositivos táctiles.

## 2. Modal de detalles de producto

Nuevo componente `ProductModal` (p. ej. `src/components/Hero/ProductModal.tsx`),
reutilizado para ambos productos vía prop `product`.

- Usa el elemento nativo `<dialog>` (sin librería de modal):
  - Se abre con `dialogRef.current?.showModal()` al hacer click en "Ver detalles".
  - Cierre nativo: botón X (`dialogRef.current?.close()`), click en backdrop
    (comparando `event.target === dialogRef.current` en el handler de click del
    propio `<dialog>`), y `Esc` (comportamiento nativo, no requiere código).
- Contenido: imagen de producto, nombre, tagline, notas, specs (tueste, molienda,
  contenido neto — el mismo contenido que hoy vive en `Products.tsx`), y el mismo
  botón "Pedir por WhatsApp" con el mensaje específico del producto (mismo evento
  GA que el CTA del Hero, mismo `value`).
- Precio: se mantiene oculto (comentado), igual que el comportamiento actual en
  `Products` y `CTA` — no se decidió mostrar precio en esta iteración.

## 3. "Nuestra Historia" — scroll pinneado con fotos

`Story.tsx` mantiene su bloque de texto (título, párrafos, cita "1 Cor 13:13",
stats 550msnm/100%/Meta) **fijo, sin cambios** durante el scroll. Lo que cambia es
el lado de la imagen.

### 3.1 Secuencia de pasos

Array de configuración (fácil de extender agregando objetos + soltando archivos en
`public/assets`):

```ts
const storySteps = [
  { image: "/assets/coffe_background.jpg", alt: "...", caption: "Origen · 550 msnm" },
  { image: "/assets/story_mountains.png", alt: "...", caption: "El Cafetal" },
  { image: "/assets/personaje_final.png", alt: "...", caption: "El Peregrino" },
  { image: "/assets/cafe_excelso.png", alt: "...", caption: "Tu Taza" },
];
```

(`coffe_background.jpg` queda libre para este uso al sacarla del Hero.)

### 3.2 Comportamiento

- **Desktop/tablet (`≥768px`)**: la sección se pinnea con GSAP `ScrollTrigger`
  (`pin: true, scrub: true`), usando `ScrollTrigger.matchMedia()` para que el pin
  solo aplique en ese breakpoint. Durante el tramo de scroll pinneado, las fotos
  hacen crossfade (`opacity`) entre sí según el progreso, sincronizadas con el
  caption corto superpuesto a cada una.
- **Mobile (`<768px`)**: sin pin (evita jank con la barra de direcciones del
  navegador). Las 4 fotos se muestran en un stack simple con fade-in normal al
  entrar en viewport, igual que el resto de animaciones de la página hoy.
- No se agrega ninguna dependencia — `gsap` y `ScrollTrigger` ya son parte del
  proyecto (`src/hooks/useGsap.ts`, y uso inline en `Hero`/`CTA`/`Story`).

## 4. Secciones y navegación eliminadas

- **`src/components/Products/`**: se elimina por completo (componente + CSS
  module). Su contenido técnico (specs) se traslada al `ProductModal` (sección 2).
- **`src/components/CTA/`**: se elimina por completo (todo el contenido era sobre
  "Combo Peregrino"). Se quita su import/uso de `src/app/page.tsx`.
- **`src/app/page.tsx`** queda: `Navbar → Hero → Story → Footer`.
- **`Navbar.tsx`**: se quita el link "Productos" (ya no hay sección aparte a la
  que apuntar). Queda: marca → "Origen" (`#origen`) → botón WhatsApp.
- El `id="combo"` del `CTA` desaparece junto con el componente. El `id="productos"`
  no se reutiliza en el Hero (no hay navegación hacia él, ver decisión de Navbar).

## 5. Testing / verificación

No hay test runner en el repo (ver `CLAUDE.md`). Verificación manual vía `npm run dev`:

- Las dos columnas del Hero abren WhatsApp con el mensaje correcto por producto,
  y disparan el evento GA con el `value` correcto (`hero-excelso` / `hero-premium`).
- "Ver detalles" abre el modal correcto por producto; cierra con X, backdrop y Esc;
  el botón de WhatsApp dentro del modal manda el mismo mensaje/evento que el de la
  columna.
- El ripple aparece solo con mouse real (probar en desktop), no se monta en un
  viewport táctil/emulado.
- El scroll pinneado de Story funciona en desktop (≥768px) y degrada a stack simple
  en mobile — probar ambos tamaños de viewport en devtools.
- La sección de combo ya no existe en ningún viewport; el link "Productos" ya no
  existe en el navbar; `npm run lint` pasa sin errores.
