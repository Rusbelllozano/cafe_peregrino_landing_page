# Hero Redesign & Combo Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Hero into a two-column, buy-ready product showcase with a detail modal and an interactive ripple background, remove every combo-related section, and add a GSAP pinned-scroll photo sequence to the "Nuestra Historia" section.

**Architecture:** `Hero` becomes a client component rendering two product columns (driven by a new shared `products.ts` data file) plus a `ProductModal` (native `<dialog>`) and a self-contained `HeroRipple` overlay. `Products` and `CTA` are deleted outright and `page.tsx`/`Navbar` are updated to match. `Story` keeps its existing text animation and gains a `storySteps.ts`-driven photo sequence pinned via `ScrollTrigger.matchMedia` on desktop, with a plain fade-in stack on mobile.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2.4, TypeScript, CSS Modules, GSAP 3.15 + ScrollTrigger (already installed — no new dependencies).

## Global Constraints

- No new npm dependencies. Animations use only `gsap`/`ScrollTrigger` (already in `package.json`); the ripple and modal use native browser APIs only (`<dialog>`, Pointer Events, CSS `@keyframes`).
- Next.js 16.3 deprecated the `next/image` `priority` prop in favor of `preload` — use `preload` (not `priority`) on any above-the-fold `<Image>`. Verified in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`.
- React 19.2.4 supports `ref` as a plain component prop — do not use `forwardRef`.
- There is no test suite/runner in this repo. Verification is `npm run lint`, `npm run build`, and manual checks against `npm run dev` (http://localhost:3000).
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- WhatsApp CTA convention: every CTA link is built with `buildWhatsAppLink(message)` from `@/lib/whatsapp` and fires `sendGAEvent('event', 'whatsapp_redirection', { value: '<location>' })` in its `onClick`.
- Styling is plain CSS Modules consuming `src/app/globals.css` design tokens (`var(--token)`) — no Tailwind/UI kit.
- Component convention: `src/components/<Name>/<Name>.tsx` (+ `<Name>.module.css`), `"use client"` on interactive components.

---

## File Structure

- **Delete:** `src/components/Products/` (whole directory)
- **Delete:** `src/components/CTA/` (whole directory)
- **Modify:** `src/app/page.tsx` — drop `Products`/`CTA`
- **Modify:** `src/components/Navbar/Navbar.tsx` — drop "Productos" link
- **Create:** `src/components/Hero/products.ts` — shared product data (`Product` type + `products` array)
- **Modify:** `src/components/Hero/Hero.tsx` — two-column layout, wires `ProductModal` and `HeroRipple`
- **Modify:** `src/components/Hero/Hero.module.css` — new layout + ripple keyframes
- **Create:** `src/components/Hero/ProductModal.tsx` — native `<dialog>` product detail modal
- **Create:** `src/components/Hero/ProductModal.module.css`
- **Create:** `src/components/Hero/HeroRipple.tsx` — self-contained ripple overlay (owns its own state so it never re-renders `Hero`)
- **Create:** `src/components/Story/storySteps.ts` — photo-sequence config (`StoryStep` type + `storySteps` array)
- **Modify:** `src/components/Story/Story.tsx` — pinned photo sequence via `ScrollTrigger.matchMedia`
- **Modify:** `src/components/Story/Story.module.css` — caption + mobile stack styles

---

### Task 1: Remove combo/Products sections and update navigation

**Files:**
- Delete: `src/components/Products/Products.tsx`
- Delete: `src/components/Products/Products.module.css`
- Delete: `src/components/CTA/CTA.tsx`
- Delete: `src/components/CTA/CTA.module.css`
- Modify: `src/app/page.tsx`
- Modify: `src/components/Navbar/Navbar.tsx`

**Interfaces:**
- Produces: `src/app/page.tsx` renders `Navbar → Hero → Story → Footer` only.

- [ ] **Step 1: Delete the Products and CTA component directories**

```bash
git rm -r src/components/Products src/components/CTA
```

- [ ] **Step 2: Update `src/app/page.tsx` to drop the removed sections**

Replace the full file contents:

```tsx
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Story from "@/components/Story/Story";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Remove the "Productos" link from the Navbar**

In `src/components/Navbar/Navbar.tsx`, remove this block from inside `<div className={styles.links}>`:

```tsx
          <a href="#productos" className={styles.link}>
            Productos
          </a>
```

Leaving `.links` with just the "Origen" link followed by the WhatsApp `ctaLink`.

- [ ] **Step 4: Verify with lint and the dev server**

Run: `npm run lint`
Expected: no errors (no more references to the deleted `Products`/`CTA` components).

Run: `npm run dev`, open http://localhost:3000
Expected: page renders Navbar → Hero (old single-column version, unchanged for now) → Story → Footer, with no "Combo Peregrino" content anywhere and no "Productos" link in the navbar.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove combo CTA and standalone Products section"
```

---

### Task 2: Extract shared product data and rebuild Hero as a two-column layout

**Files:**
- Create: `src/components/Hero/products.ts`
- Modify: `src/components/Hero/Hero.tsx`
- Modify: `src/components/Hero/Hero.module.css`

**Interfaces:**
- Produces: `export type Product = { id: string; name: string; tagline: string; notes: string; roast: string; grind: string; weight: string; image: string; accent: string; whatsappMessage: string; }` and `export const products: Product[]` from `src/components/Hero/products.ts` — consumed by `Hero.tsx` (this task) and `ProductModal.tsx` (Task 3).

- [ ] **Step 1: Create the shared product data file**

`src/components/Hero/products.ts`:

```ts
export type Product = {
  id: string;
  name: string;
  tagline: string;
  notes: string;
  roast: string;
  grind: string;
  weight: string;
  image: string;
  accent: string;
  whatsappMessage: string;
};

export const products: Product[] = [
  {
    id: "excelso",
    name: "Excelso",
    tagline: "Intenso · Cítrico · Brillante",
    notes: "Notas intensas a cacao y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    image: "/assets/cafe_excelso.png",
    accent: "var(--magenta)",
    whatsappMessage: "Hola, quiero pedir el Café Peregrino Excelso",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Suave · Balanceado · Envolvente",
    notes: "Notas a chocolate y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    image: "/assets/cafe_premium.png",
    accent: "var(--orange)",
    whatsappMessage: "Hola, quiero pedir el Café Peregrino Premium",
  },
];
```

- [ ] **Step 2: Rewrite `Hero.tsx` as a two-column layout**

Replace the full file contents of `src/components/Hero/Hero.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { products } from "./products";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className={styles.hero}>
      <div className={styles.content}>
        <p className={`${styles.origin} hero-anim`}>
          Regiones Montañosas del Meta · 1200 - 1600 msnm
        </p>
        <h1 className={`${styles.brandName} hero-anim`}>Café Peregrino</h1>
        <div className={`${styles.badge} hero-anim`}>
          Lote Limitado · Primera Edición
        </div>
        <div className={styles.columns}>
          {products.map((product) => (
            <article key={product.id} className={`${styles.column} hero-anim`}>
              <div className={styles.imageWrap}>
                <Image
                  src={product.image}
                  alt={`Café Peregrino ${product.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  preload
                />
              </div>
              <div className={styles.info}>
                <span
                  className={styles.accentLine}
                  style={{ background: product.accent }}
                />
                <h2 className={styles.productName}>{product.name}</h2>
                <p className={styles.tagline}>{product.tagline}</p>
                <a
                  href={buildWhatsAppLink(product.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                  onClick={() =>
                    sendGAEvent("event", "whatsapp_redirection", {
                      value: `hero-${product.id}`,
                    })
                  }
                >
                  <WhatsAppIcon />
                  Pedir por WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Rewrite `Hero.module.css`**

Replace the full file contents of `src/components/Hero/Hero.module.css`:

```css
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--navy);
  padding: var(--space-2xl) var(--space-md) var(--space-lg);
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  max-width: var(--max-width);
  width: 100%;
}

.origin {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green-lime);
}

.brandName {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  color: #fff;
}

.badge {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--orange);
  padding: 0.5rem 1.5rem;
  border: 1px solid rgba(255, 127, 17, 0.3);
  border-radius: 100px;
  margin-bottom: 0.5rem;
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  width: 100%;
  margin-top: 1rem;
}

.column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(245, 239, 234, 0.04);
  border: 1px solid rgba(245, 239, 234, 0.1);
  border-radius: var(--border-radius-lg);
  padding: var(--space-md);
}

.imageWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.accentLine {
  display: block;
  width: 40px;
  height: 3px;
  border-radius: 2px;
}

.productName {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  color: #fff;
}

.tagline {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-xl) var(--space-sm) var(--space-lg);
  }

  .columns {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
```

- [ ] **Step 4: Verify with lint and the dev server**

Run: `npm run lint`
Expected: no errors.

Run: `npm run dev`, open http://localhost:3000
Expected: Hero shows a dark-navy background, brand name + origin line + urgency badge, then two side-by-side columns (Excelso, Premium) each with its product photo, name, tagline, and a "Pedir por WhatsApp" button. On a narrow viewport (<768px) the columns stack vertically. Clicking each button opens WhatsApp with the correct product-specific prefilled message (check the `href` in devtools — Excelso's must contain `Excelso`, Premium's `Premium`).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero src/app/page.tsx
git commit -m "feat: rebuild Hero as a two-column product showcase"
```

---

### Task 3: Add the product detail modal

**Files:**
- Create: `src/components/Hero/ProductModal.tsx`
- Create: `src/components/Hero/ProductModal.module.css`
- Modify: `src/components/Hero/Hero.tsx`
- Modify: `src/components/Hero/Hero.module.css`

**Interfaces:**
- Consumes: `Product` type and `products` array from `src/components/Hero/products.ts` (Task 2).
- Produces: `export default function ProductModal({ product, ref }: { product: Product; ref?: React.Ref<HTMLDialogElement> })` from `src/components/Hero/ProductModal.tsx` — a `<dialog>` element callers open via `ref.current?.showModal()`.

- [ ] **Step 1: Create `ProductModal.tsx`**

`src/components/Hero/ProductModal.tsx`:

```tsx
"use client";

import type { Ref } from "react";
import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import type { Product } from "./products";
import styles from "./ProductModal.module.css";

type Props = {
  product: Product;
  ref?: Ref<HTMLDialogElement>;
};

export default function ProductModal({ product, ref }: Props) {
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={styles.close}
          aria-label="Cerrar"
          onClick={(event) => event.currentTarget.closest("dialog")?.close()}
        >
          ×
        </button>
        <div className={styles.imageWrap}>
          <Image
            src={product.image}
            alt={`Café Peregrino ${product.name}`}
            width={400}
            height={400}
            className={styles.image}
          />
        </div>
        <span
          className={styles.accentLine}
          style={{ background: product.accent }}
        />
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={styles.notes}>{product.notes}</p>
        <div className={styles.specs}>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Tostión</span>
            <span className={styles.specValue}>{product.roast}</span>
          </div>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Molienda</span>
            <span className={styles.specValue}>{product.grind}</span>
          </div>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Cont. Neto</span>
            <span className={styles.specValue}>{product.weight}</span>
          </div>
        </div>
        <a
          href={buildWhatsAppLink(product.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          onClick={() =>
            sendGAEvent("event", "whatsapp_redirection", {
              value: `hero-${product.id}`,
            })
          }
        >
          <WhatsAppIcon />
          Pedir por WhatsApp
        </a>
      </div>
    </dialog>
  );
}
```

- [ ] **Step 2: Create `ProductModal.module.css`**

`src/components/Hero/ProductModal.module.css`:

```css
.dialog {
  margin: auto;
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 0;
  max-width: 420px;
  width: calc(100vw - 2rem);
  background: var(--cream);
  color: var(--text-dark);
}

.dialog::backdrop {
  background: rgba(19, 41, 61, 0.75);
  backdrop-filter: blur(4px);
}

.content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: var(--space-lg) var(--space-md) var(--space-md);
}

.close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--text-dark);
  border-radius: 50%;
  transition: background var(--duration-fast) var(--ease-out);
}

.close:hover {
  background: rgba(43, 43, 43, 0.08);
}

.imageWrap {
  width: 160px;
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: linear-gradient(135deg, #f8f4f0, #ede5dc);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.accentLine {
  display: block;
  width: 40px;
  height: 3px;
  border-radius: 2px;
}

.name {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  color: var(--navy);
}

.tagline {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dark);
  opacity: 0.5;
}

.notes {
  font-family: var(--font-script);
  font-size: 1.1rem;
  color: var(--text-dark);
  line-height: 1.5;
}

.specs {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  margin-top: 0.25rem;
  border-top: 1px solid rgba(43, 43, 43, 0.08);
}

.spec {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.specLabel {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-dark);
  opacity: 0.4;
}

.specValue {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--navy);
}
```

- [ ] **Step 3: Wire the modal and "Ver detalles" trigger into `Hero.tsx`**

In `src/components/Hero/Hero.tsx`, add the imports:

```tsx
import ProductModal from "./ProductModal";
```

right after `import { products } from "./products";`.

Add a ref map inside the component, right after `const sectionRef = useRef<HTMLElement>(null);`:

```tsx
  const modalRefs = useRef<{ [id: string]: HTMLDialogElement | null }>({});
```

Inside the `.info` div, right after the closing `</a>` of the WhatsApp button, add:

```tsx
                <button
                  type="button"
                  className={styles.detailsLink}
                  onClick={() => modalRefs.current[product.id]?.showModal()}
                >
                  Ver detalles
                </button>
```

As a sibling of the `.content` div, right before the closing `</section>` tag, add the modal instances:

```tsx
      {products.map((product) => (
        <ProductModal
          key={product.id}
          product={product}
          ref={(el) => {
            modalRefs.current[product.id] = el;
          }}
        />
      ))}
```

- [ ] **Step 4: Add `.detailsLink` styles to `Hero.module.css`**

Append to `src/components/Hero/Hero.module.css`:

```css

.detailsLink {
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--duration-fast) var(--ease-out);
}

.detailsLink:hover {
  color: #fff;
}
```

- [ ] **Step 5: Verify with lint and the dev server**

Run: `npm run lint`
Expected: no errors.

Run: `npm run dev`, open http://localhost:3000
Expected: each column shows a "Ver detalles" link below the WhatsApp button. Clicking Excelso's opens a modal with Excelso's photo, tagline, notes, specs (Media / Fina o Grano entero / 250 g - 500 g) and its own "Pedir por WhatsApp" button (href containing "Excelso"). Same for Premium. The modal closes via the × button, via clicking the dimmed backdrop, and via pressing `Esc`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero
git commit -m "feat: add product detail modal to Hero"
```

---

### Task 4: Add the interactive ripple background to the Hero

**Files:**
- Create: `src/components/Hero/HeroRipple.tsx`
- Modify: `src/components/Hero/Hero.tsx`
- Modify: `src/components/Hero/Hero.module.css`

**Interfaces:**
- Produces: `export default function HeroRipple()` from `src/components/Hero/HeroRipple.tsx` — a self-contained absolutely-positioned overlay with no props; owns its own ripple state so mounting it doesn't cause `Hero` itself to re-render on every pointer move.

- [ ] **Step 1: Create `HeroRipple.tsx`**

`src/components/Hero/HeroRipple.tsx`:

```tsx
"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import styles from "./Hero.module.css";

type Ripple = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const RIPPLE_COLORS = ["var(--magenta)", "var(--orange)"];
const THROTTLE_MS = 120;

export default function HeroRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const lastSpawn = useRef(0);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    const now = Date.now();
    if (now - lastSpawn.current < THROTTLE_MS) return;
    lastSpawn.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    const color = RIPPLE_COLORS[id % RIPPLE_COLORS.length];

    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top, color },
    ]);
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  return (
    <div
      className={styles.rippleLayer}
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y, background: ripple.color }}
          onAnimationEnd={() => removeRipple(ripple.id)}
        />
      ))}
    </div>
  );
}
```

`event.pointerType !== "mouse"` is the touch/mobile gate from the spec: touch and pen input never spawn ripples, and since the layer only receives events for the exposed background (columns sit above it and capture their own pointer events first), the effect is scoped to "the Hero background" as designed.

- [ ] **Step 2: Render `HeroRipple` inside `Hero.tsx`**

Add the import in `src/components/Hero/Hero.tsx`, after `import ProductModal from "./ProductModal";`:

```tsx
import HeroRipple from "./HeroRipple";
```

Add `<HeroRipple />` as the first child of the `<section>`, right before `<div className={styles.content}>`:

```tsx
    <section id="hero" ref={sectionRef} className={styles.hero}>
      <HeroRipple />
      <div className={styles.content}>
```

- [ ] **Step 3: Add ripple styles to `Hero.module.css`**

Append to `src/components/Hero/Hero.module.css`:

```css

.rippleLayer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.ripple {
  position: absolute;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-top: -12px;
  border-radius: 50%;
  opacity: 0.5;
  animation: ripple-expand 900ms ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  from {
    transform: scale(0);
    opacity: 0.5;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

- [ ] **Step 4: Verify with lint and the dev server**

Run: `npm run lint`
Expected: no errors.

Run: `npm run dev`, open http://localhost:3000 in a desktop browser
Expected: moving the mouse over the empty navy background around/between the two columns spawns small rings that expand and fade out, alternating magenta/orange. Moving the mouse directly over a column (image/buttons) does not spawn rings (that area is opaque content, not background). In Chrome DevTools, toggle device toolbar to a touch device — no rings should appear when simulating touch drag (mouse-emulated touch events report `pointerType: "touch"`).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero
git commit -m "feat: add interactive ripple background to Hero"
```

---

### Task 5: Add the GSAP pinned-scroll photo sequence to Story

**Files:**
- Create: `src/components/Story/storySteps.ts`
- Modify: `src/components/Story/Story.tsx`
- Modify: `src/components/Story/Story.module.css`

**Interfaces:**
- Produces: `export type StoryStep = { image: string; alt: string; caption: string; }` and `export const storySteps: StoryStep[]` from `src/components/Story/storySteps.ts` — consumed by `Story.tsx`. Adding a fifth step later is just appending an object here and dropping the file in `public/assets`.

- [ ] **Step 1: Create `storySteps.ts`**

`src/components/Story/storySteps.ts`:

```ts
export type StoryStep = {
  image: string;
  alt: string;
  caption: string;
};

export const storySteps: StoryStep[] = [
  {
    image: "/assets/coffe_background.jpg",
    alt: "Amanecer sobre las montañas cafeteras del Meta",
    caption: "Origen · 1200 - 1600 msnm",
  },
  {
    image: "/assets/story_mountains.png",
    alt: "Cafetales en las montañas del Meta",
    caption: "El Cafetal",
  },
  {
    image: "/assets/personaje_final.png",
    alt: "El peregrino, personaje de la marca Café Peregrino",
    caption: "El Peregrino",
  },
  {
    image: "/assets/cafe_excelso.png",
    alt: "Café Peregrino Excelso listo para servir",
    caption: "Tu Taza",
  },
];
```

- [ ] **Step 2: Rewrite `Story.tsx`**

Replace the full file contents of `src/components/Story/Story.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { storySteps } from "./storySteps";
import styles from "./Story.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".story-text-anim",
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          const steps = gsap.utils.toArray<HTMLElement>(".story-step");
          if (steps.length < 2) return;

          gsap.set(steps, { opacity: 0 });
          gsap.set(steps[0], { opacity: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${(steps.length - 1) * window.innerHeight}`,
              scrub: true,
              pin: true,
            },
          });

          steps.forEach((step, index) => {
            if (index === 0) return;
            tl.to(steps[index - 1], { opacity: 0, duration: 1 }, index - 1);
            tl.to(step, { opacity: 1, duration: 1 }, index - 1);
          });
        },
        "(max-width: 767px)": () => {
          gsap.fromTo(
            ".story-step",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
                once: true,
              },
            }
          );
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="origen" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textBlock}>
          <p className={`${styles.label} story-text-anim`}>Nuestra Historia</p>
          <h2 className={`${styles.title} story-text-anim`}>
            De la Montaña
            <br />
            a Tu Taza
          </h2>
          <p className={`${styles.body} story-text-anim`}>
            En las regiones montañosas del Meta, a 1200 - 1600 metros sobre el nivel
            del mar, nace un café con propósito. Cada grano recorre un camino de
            cuidado, selección y pasión antes de llegar a tus manos.
          </p>
          <p className={`${styles.body} story-text-anim`}>
            Café Peregrino no es solo café — es un viaje. Un homenaje a quienes
            caminan con fe, buscando algo más grande que ellos mismos.
          </p>
          <blockquote className={`${styles.quote} story-text-anim`}>
            <span className={styles.quoteScript}>Café y Esperanza</span>
            <span className={styles.quoteVerse}>1 Cor 13:13</span>
          </blockquote>
          <div className={`${styles.stats} story-text-anim`}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>550</span>
              <span className={styles.statLabel}>msnm</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Colombia</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>Origen</span>
              <span className={styles.statLabel}>Meta</span>
            </div>
          </div>
        </div>
        <div className={styles.imageBlock}>
          <div className={styles.imageWrapper}>
            {storySteps.map((step, index) => (
              <div
                key={step.image}
                className={`${styles.imageInner} story-step`}
                data-step={index}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
                <span className={styles.caption}>{step.caption}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update `Story.module.css`**

In `src/components/Story/Story.module.css`, replace the `.imageInner` rule with a version that also positions the caption context, and add a `.caption` rule right after it:

```css
.imageInner {
  position: absolute;
  inset: -15% 0;
  width: 100%;
  height: 130%;
}

.caption {
  position: absolute;
  left: 1.25rem;
  bottom: 1.25rem;
  z-index: 1;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(19, 41, 61, 0.55);
  padding: 0.4rem 1rem;
  border-radius: 100px;
}
```

Then, inside the existing `@media (max-width: 768px)` block, remove the old `.imageWrapper { aspect-ratio: 16/10; }` rule and replace it with:

```css
  .imageWrapper {
    aspect-ratio: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 0;
    overflow: visible;
  }

  .imageInner {
    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
    aspect-ratio: 16/10;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }
```

So the full `@media (max-width: 768px)` block in `Story.module.css` ends up as:

```css
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .imageWrapper {
    aspect-ratio: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 0;
    overflow: visible;
  }

  .imageInner {
    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
    aspect-ratio: 16/10;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
  }

  .stats {
    gap: 1.25rem;
  }

  .statNumber {
    font-size: 1.4rem;
  }
}
```

- [ ] **Step 4: Verify with lint and the dev server**

Run: `npm run lint`
Expected: no errors.

Run: `npm run dev`, open http://localhost:3000 at a desktop width (≥768px)
Expected: scrolling down into "Nuestra Historia" pins the section (text block on the left stays fixed) while the photo on the right crossfades through all 4 images with their captions ("Origen · 1200 - 1600 msnm" → "El Cafetal" → "El Peregrino" → "Tu Taza") as you keep scrolling; the page un-pins and continues normally after the last photo.

Resize DevTools to a mobile width (<768px), reload, and scroll to the section
Expected: no pinning occurs; the 4 photos render as a simple vertical stack, each fading in as it enters the viewport, each with its caption.

- [ ] **Step 5: Commit**

```bash
git add src/components/Story
git commit -m "feat: add pinned-scroll story photo sequence"
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full lint and production build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 2: Confirm no combo references remain**

Run: `grep -ril "combo" src/`
Expected: no output (no matches).

- [ ] **Step 3: Full manual smoke test**

Run: `npm run dev`, open http://localhost:3000 and walk the whole page:
- Navbar: brand, "Origen" link (scrolls to Story), WhatsApp button — no "Productos" link.
- Hero: ripple on background hover (desktop), two columns with correct WhatsApp messages and GA `value`s (`hero-excelso` / `hero-premium`), "Ver detalles" opens the matching modal, modal closes via X/backdrop/Esc.
- Story: pinned photo sequence on desktop, simple fade-in stack on mobile width.
- Footer: unchanged.
- No section or link anywhere mentions "combo" or "Combo Peregrino".

- [ ] **Step 4: Commit (only if Step 1–3 required fixes)**

```bash
git add -A
git commit -m "fix: address final verification findings"
```

If no fixes were needed, skip this commit — the plan is complete.
