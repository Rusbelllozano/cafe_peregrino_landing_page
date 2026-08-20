# Hero Redesign Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the deferred minor findings from the hero-redesign branch (PR #4) — a deprecated GSAP API, a dead attribute, file/token tidiness — and add `prefers-reduced-motion` support to the Hero's ripple effect and the Story section's pinned photo sequence.

**Architecture:** Five small, independent-per-file edits on top of the already-merged-to-branch hero redesign. No new components, no new dependencies. The two `prefers-reduced-motion` tasks each add one early branch to existing GSAP setup code — no new animation system.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2.4, TypeScript, CSS Modules, GSAP 3.15 + ScrollTrigger (already installed — no new dependencies).

## Global Constraints

- No new npm dependencies.
- There is no test suite/runner in this repo. Verification is `npm run lint`, `npm run build`, and manual checks against `npm run dev` (http://localhost:3000).
- Path alias `@/*` → `src/*`.
- Styling is plain CSS Modules consuming `src/app/globals.css` design tokens — no Tailwind/UI kit.
- Out of scope (explicitly decided, do not add tasks for these): differentiating `roast`/`grind`/`weight` between Excelso and Premium in `src/components/Hero/products.ts` (content/business decision, not code); the ripple's hit-area gap between the Hero's two columns (accepted design limitation).

---

## File Structure

- **Modify:** `src/components/Story/Story.tsx` — twice (Task 1: GSAP API migration + dead attribute removal; Task 5: `prefers-reduced-motion` gate)
- **Modify:** `src/components/Hero/Hero.module.css` — rule reordering only, no new selectors
- **Modify:** `src/app/globals.css` — remove one unused custom property
- **Modify:** `src/components/Hero/HeroRipple.tsx` — add a `prefers-reduced-motion` gate

---

### Task 1: Migrate Story's GSAP API and remove the dead `data-step` attribute

**Files:**
- Modify: `src/components/Story/Story.tsx`

**Interfaces:**
- Produces: the same visual behavior as before (desktop pin/crossfade ≥769px, mobile fade-stack ≤768px) — this task is a pure refactor, no behavior change. Task 5 builds directly on the `gsap.matchMedia()` shape this task introduces.

`ScrollTrigger.matchMedia()` is deprecated in GSAP 3.11+ in favor of `gsap.matchMedia()` (confirmed in this project's installed copy: `node_modules/gsap/types/scroll-trigger.d.ts` marks it "Deprecated in favor of gsap.matchMedia()"). It still works today, but this task swaps it for the current API. The `data-step={index}` attribute on each photo's wrapper div is never read by any CSS selector or JS query in the codebase — dead code, remove it.

- [ ] **Step 1: Replace `ScrollTrigger.matchMedia` with `gsap.matchMedia()` and remove `data-step`**

Replace the full contents of `src/components/Story/Story.tsx` with:

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

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
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
      });

      mm.add("(max-width: 768px)", () => {
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

Note what changed from the current file: `ScrollTrigger.matchMedia({ "(min-width: 769px)": fn1, "(max-width: 768px)": fn2 })` became `const mm = gsap.matchMedia(); mm.add("(min-width: 769px)", fn1); mm.add("(max-width: 768px)", fn2);` (same two functions, unchanged bodies), and the `index` parameter in the `storySteps.map` callback dropped its only use (`data-step={index}`) — the map callback still takes `(step, index)` only for the `key`... actually `key` uses `step.image`, not `index`, so `index` is now completely unused in the callback signature. Keep the callback as `(step, index) =>` anyway — do NOT remove the `index` parameter itself, since removing an unused trailing-but-not-last-positional lambda parameter is optional in JS/TS and ESLint's `no-unused-vars` does not flag unused function parameters by default in this repo's config (only unused variables/assignments, per the existing `discounts.ts` warning being about an assigned variable, not a parameter). Leaving `index` in place is simpler than restructuring the `.map()` call.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: 0 errors (the one pre-existing unrelated warning in `src/lib/discounts.ts` is expected and fine).

Run: `npm run build`
Expected: success, no type errors.

Run: `grep -n "ScrollTrigger.matchMedia\|data-step" src/components/Story/Story.tsx`
Expected: no output (both are gone).

- [ ] **Step 3: Commit**

```bash
git add src/components/Story/Story.tsx
git commit -m "refactor: migrate Story to gsap.matchMedia and drop dead data-step attribute"
```

---

### Task 2: Reorder Hero.module.css so the mobile media query is last

**Files:**
- Modify: `src/components/Hero/Hero.module.css`

**Interfaces:** None — pure reordering, no selector names or values change.

Currently the `@media (max-width: 768px)` block sits in the middle of the file (after `.tagline`, before `.detailsLink`/`.rippleLayer`/`.ripple`/`@keyframes ripple-expand`, which were appended by later tasks on the original branch). Move the media query block to the end of the file so the file reads as "base rules, then responsive overrides" — no behavior change, CSS specificity/cascade order for these non-overlapping selectors is unaffected by reordering since none of the moved rules and none of the rules it moves past share a selector.

- [ ] **Step 1: Move the media query block to the end of the file**

Replace the full contents of `src/components/Hero/Hero.module.css` with:

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

- [ ] **Step 2: Verify with lint and a visual smoke check**

Run: `npm run lint`
Expected: 0 errors.

Run: `npm run build`
Expected: success.

This is a pure reordering — diff the rule content (not position) against the previous file to confirm nothing was dropped or altered: `git diff src/components/Hero/Hero.module.css` should show only *moved* lines (deletions of the media query block from its old position, an identical block re-added at the end), with every selector's declarations byte-identical to before.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero/Hero.module.css
git commit -m "style: move Hero.module.css mobile media query to end of file"
```

---

### Task 3: Remove the unused `--max-width-narrow` token

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:** None.

`--max-width-narrow: 800px;` was only consumed by `src/components/CTA/CTA.module.css`, which was deleted earlier on this branch (the "Combo Peregrino" section removal). No other file in `src/` references it.

- [ ] **Step 1: Remove the unused custom property**

In `src/app/globals.css`, in the `/* Layout */` group inside `:root`, remove this line:

```css
  --max-width-narrow: 800px;
```

So the `/* Layout */` group becomes:

```css
  /* Layout */
  --max-width: 1200px;
  --border-radius: 12px;
  --border-radius-lg: 20px;
```

- [ ] **Step 2: Verify nothing else references it, then lint/build**

Run: `grep -rn "max-width-narrow" src/`
Expected: no output.

Run: `npm run lint && npm run build`
Expected: both succeed with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "chore: remove unused --max-width-narrow token"
```

---

### Task 4: Respect `prefers-reduced-motion` in the Hero ripple effect

**Files:**
- Modify: `src/components/Hero/HeroRipple.tsx`

**Interfaces:**
- Produces: `HeroRipple` behaves exactly as before for users without the OS/browser "reduce motion" preference; for users with it set, `handlePointerMove` becomes a no-op (no ripple ever spawns) — no other component changes, `<HeroRipple />` is still rendered unconditionally by `Hero.tsx`.

Checked once, on mount, via `window.matchMedia("(prefers-reduced-motion: reduce)").matches` — not re-checked on every pointer move, and not live-updated if the OS setting changes while the page is open (out of scope: this is a rare toggle, and re-checking per-event would run a `matchMedia` call inside the hot pointermove path for no real benefit).

- [ ] **Step 1: Gate ripple spawning on `prefers-reduced-motion`**

Replace the full contents of `src/components/Hero/HeroRipple.tsx` with:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
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
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion.current) return;
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

The only changes from the current file: `useEffect` added to the imports, a `prefersReducedMotion` ref initialized to `false`, a mount-time effect that sets it, and one new guard line (`if (prefersReducedMotion.current) return;`) as the first line inside `handlePointerMove`.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: 0 errors.

Run: `npm run build`
Expected: success.

Run: `grep -n "prefers-reduced-motion" src/components/Hero/HeroRipple.tsx`
Expected: one match, inside the `useEffect`.

Note for whoever runs the final manual pass: actually toggling "reduce motion" (Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion") and confirming no ripples spawn on mouse move needs a real browser — no agent in this pipeline has one. Flag it for a human check rather than skipping verification silently.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero/HeroRipple.tsx
git commit -m "feat: respect prefers-reduced-motion in Hero ripple effect"
```

---

### Task 5: Respect `prefers-reduced-motion` in the Story pinned sequence

**Files:**
- Modify: `src/components/Story/Story.tsx`

**Interfaces:**
- Consumes: the `gsap.matchMedia()`-based structure Task 1 introduced (the `mm.add("(min-width: 769px)", ...)` / `mm.add("(max-width: 768px)", ...)` pair).
- Produces: when `prefers-reduced-motion: reduce` is set, the Story section never pins and never crossfades on any viewport width — it always uses the same simple fade-in-on-scroll stack that today only runs on mobile. Users without that preference see unchanged behavior (desktop pin/crossfade ≥769px, mobile fade-stack ≤768px).

- [ ] **Step 1: Add the reduced-motion early-return, factoring the shared fade-stack animation into one function**

In `src/components/Story/Story.tsx`, replace the body of the `gsap.context(() => { ... }, section)` callback (the code between `gsap.fromTo(".story-text-anim", ...)` and the `}, section);` line — i.e. everything from `const mm = gsap.matchMedia();` through the end of the second `mm.add(...)` call, as written by Task 1) with:

```tsx
      const playFadeStack = () => {
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
      };

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        playFadeStack();
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
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
      });

      mm.add("(max-width: 768px)", playFadeStack);
```

The full `useEffect` block should now read (for reference — confirm your edit produces exactly this):

```tsx
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

      const playFadeStack = () => {
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
      };

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        playFadeStack();
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
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
      });

      mm.add("(max-width: 768px)", playFadeStack);
    }, section);

    return () => ctx.revert();
  }, []);
```

Nothing else in the file (imports, JSX) changes in this task.

- [ ] **Step 2: Verify with lint and build**

Run: `npm run lint`
Expected: 0 errors.

Run: `npm run build`
Expected: success.

Run: `grep -n "prefers-reduced-motion\|playFadeStack" src/components/Story/Story.tsx`
Expected: `prefers-reduced-motion` appears once (inside the `window.matchMedia` call); `playFadeStack` appears 3 times (the `const` declaration, the `if (prefersReducedMotion)` call, and the `mm.add("(max-width: 768px)", playFadeStack)` reference).

Note for whoever runs the final manual pass: confirming the pin genuinely never engages with reduced-motion enabled (on both desktop and mobile viewport widths) needs a real browser (Chrome DevTools' "Emulate CSS media feature prefers-reduced-motion" plus resizing) — no agent in this pipeline has one. Flag it for a human check.

- [ ] **Step 3: Commit**

```bash
git add src/components/Story/Story.tsx
git commit -m "feat: respect prefers-reduced-motion in Story pinned sequence"
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full lint and production build**

Run: `npm run lint`
Expected: 0 errors (1 known pre-existing unrelated warning in `src/lib/discounts.ts` is fine).

Run: `npm run build`
Expected: success, no type errors.

- [ ] **Step 2: Confirm all five findings are actually gone**

```bash
grep -rn "ScrollTrigger.matchMedia" src/components/Story/Story.tsx   # expect: no output
grep -n "data-step" src/components/Story/Story.tsx                  # expect: no output
grep -n "max-width-narrow" src/app/globals.css                      # expect: no output
grep -n "prefers-reduced-motion" src/components/Hero/HeroRipple.tsx # expect: 1 match
grep -n "prefers-reduced-motion" src/components/Story/Story.tsx     # expect: 1 match
```

Also confirm `src/components/Hero/Hero.module.css`'s last non-blank rule in the file is the `@media (max-width: 768px)` block: `tail -20 src/components/Hero/Hero.module.css`.

- [ ] **Step 3: Bounded dev-server smoke test**

Background the dev server, sleep, curl with a timeout, then kill the PID explicitly — do not let any command hang unbounded:

```bash
npm run dev > /tmp/cleanup-dev.log 2>&1 &
DEVPID=$!
sleep 6
curl -s -m 5 http://localhost:3000 -o /tmp/cleanup-home.html
grep -c "Origen · 1200 - 1600 msnm\|El Cafetal\|El Peregrino\|Tu Taza" /tmp/cleanup-home.html || true
kill $DEVPID 2>/dev/null
```

Expected: HTTP 200 (curl doesn't error), all 4 captions still present — confirming the Story refactor (Tasks 1 and 5) didn't break rendering.

- [ ] **Step 4: Commit (only if Step 1–3 required fixes)**

```bash
git add -A
git commit -m "fix: address cleanup-plan verification findings"
```

If no fixes were needed, skip this commit — the plan is complete.
