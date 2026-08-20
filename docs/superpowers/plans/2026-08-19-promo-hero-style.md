# Promo Page Hero-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/promo` code-entry screen to match the current Hero's navy + interactive-ripple visual language, while keeping the success (discount-revealed) screen exactly as it is today on its cream background.

**Architecture:** `src/app/promo/page.tsx` splits its single always-cream `.pageContainer` into two independent full-viewport state wrappers: `.entryState` (navy background, reuses the existing `HeroRipple` component, Hero-style origin line + brand heading + badge + a translucent card holding the existing code-input form) and `.successState` (the old `.pageContainer` look, unchanged, wrapping the untouched success markup). No validation logic, API contract, or success-state markup changes.

**Tech Stack:** Next.js 16.3 (App Router), React 19.2.4, TypeScript, CSS Modules, GSAP 3.15 (already installed — no new dependencies).

## Global Constraints

- No new npm dependencies. The entrance animation uses `gsap` (already in `package.json`); the ripple reuses the existing `HeroRipple` component as-is.
- There is no test suite/runner in this repo. Verification is `npm run lint` and manual checks against `npm run dev` (http://localhost:3000/promo).
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- WhatsApp CTA convention: `buildWhatsAppLink(message)` from `@/lib/whatsapp` + `sendGAEvent('event', 'whatsapp_redirection', { value: '<location>' })` — the success state's CTA already follows this with `value: 'promo'` and stays unchanged.
- Styling is plain CSS Modules consuming `src/app/globals.css` design tokens (`var(--token)`) — no Tailwind/UI kit.
- `/promo` remains a standalone page: no navbar is added.
- Per the approved spec (`docs/superpowers/specs/2026-08-19-promo-hero-style-design.md`): `POST /api/promo`, `DiscountResult`, `checkCode`/`handleInputChange`/error-shake timing, and all success-state markup/animations/copy are untouched.

---

## File Structure

- **Modify:** `src/app/promo/page.tsx` — wrap the entry state in a new `.entryState` container that renders `HeroRipple` + a Hero-style header (origin line, brand heading, badge) around the existing form, now inside a card (`.formContainer`, restyled); wrap the success state in a new `.successState` container; add an inline GSAP entrance effect for the entry state.
- **Modify:** `src/app/promo/Promo.module.css` — replace `.pageContainer` with `.successState` (identical rules) and add `.entryState`/`.entryContent`/`.origin`/`.brandName`/`.entryBadge`/`.homeLinkOnDark`; restyle `.formContainer` (translucent card) and `.inputTitle`/`.inputDescription` (light-on-dark colors) for the new dark surface.
- No new files. `HeroRipple` (`src/components/Hero/HeroRipple.tsx`) is imported, not duplicated.

---

### Task 1: Restyle the promo entry screen to match Hero, keep success screen unchanged

**Files:**
- Modify: `src/app/promo/page.tsx`
- Modify: `src/app/promo/Promo.module.css`

**Interfaces:**
- Consumes: `HeroRipple` default export from `@/components/Hero/HeroRipple` (no props). `buildWhatsAppLink(message: string): string` from `@/lib/whatsapp`. `DiscountResult` type from `@/lib/discounts` (`{ id, discount, text, subtext, whatsapp_message }`). `gsap` default export from `gsap`.
- Produces: no exports consumed elsewhere — `PromoPage` is a route leaf.

- [ ] **Step 1: Replace `src/app/promo/page.tsx` with the restructured version**

Replace the full file contents:

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { DiscountResult } from "@/lib/discounts";
import HeroRipple from "@/components/Hero/HeroRipple";
import styles from "./Promo.module.css";

const CODE_LENGTH = 6;

export default function PromoPage() {
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [matchedDiscount, setMatchedDiscount] = useState<DiscountResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const entryRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Entrance animation for the entry screen, mirrors Hero.tsx's inline GSAP pattern
  useEffect(() => {
    const section = entryRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".promo-anim",
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

  // Clear the shake animation after it finishes. isShaking is turned on
  // wherever an error is raised (see setError below); isError itself stays
  // true (driving the error text / aria state) until the user types again.
  useEffect(() => {
    if (!isShaking) return;
    const timeoutId = setTimeout(() => {
      setIsShaking(false);
    }, 500); // 500ms matches the CSS animation duration
    return () => clearTimeout(timeoutId);
  }, [isShaking]);

  const setError = () => {
    setIsError(true);
    setIsShaking(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit length
    const value = e.target.value.toUpperCase().slice(0, CODE_LENGTH);
    setCode(value);

    // Reset error when typing
    if (isError) setIsError(false);

    // Auto-check when length reaches exactly 6
    if (value.length === CODE_LENGTH) {
      checkCode(value);
    }
  };

  const checkCode = async (valueToCheck: string) => {
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: valueToCheck }),
      });

      if (!res.ok) {
        setError();
        return;
      }

      const discount: DiscountResult = await res.json();
      setMatchedDiscount(discount);
    } catch {
      setError();
    }
  };

  // Split title for animation
  const cafeLetters = "Café".split("");
  const peregrinoLetters = "Peregrino".split("");

  return (
    <main>
      {/* ENTRY STATE */}
      {!matchedDiscount && (
        <div ref={entryRef} className={styles.entryState}>
          <HeroRipple />
          <div className={styles.entryContent}>
            <p className={`${styles.origin} promo-anim`}>
              Regiones Montañosas del Meta · 1200 - 1600 msnm
            </p>
            <h1 className={`${styles.brandName} promo-anim`}>Café Peregrino</h1>
            <div className={`${styles.entryBadge} promo-anim`}>
              Código de Descuento
            </div>

            <div className={`${styles.formContainer} promo-anim`}>
              <h2 className={styles.inputTitle}>Desbloquea tu Descuento</h2>
              <p className={styles.inputDescription}>
                Ingresa tu código de 6 dígitos para descubrir tu beneficio.
              </p>

              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={handleInputChange}
                  placeholder="000000"
                  className={`${styles.discountInput} ${isError ? styles.error : ""} ${isShaking ? styles.shaking : ""}`}
                  maxLength={CODE_LENGTH}
                  aria-invalid={isError}
                  aria-describedby="promo-code-error"
                />
                <div
                  id="promo-code-error"
                  role="alert"
                  className={`${styles.errorMessage} ${isError ? styles.visible : ""}`}
                >
                  {isError ? "Código no válido. Intenta de nuevo." : ""}
                </div>
              </div>
              <Link href="/" className={`${styles.homeLink} ${styles.homeLinkOnDark}`}>
                Para saber más sobre nosotros
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {matchedDiscount && (
        <div className={styles.successState}>
          <div className={styles.successContainer}>
            <div className={styles.imageWrapper}>
              <div className={styles.speechBubble}>Gracias!</div>
              <Image
                src="/assets/personaje_final.png"
                alt="Personaje Cafe Peregrino"
                width={500}
                height={500}
                className={styles.personajeImage}
                priority
              />
            </div>

            <div className={styles.titleContainer}>
              <div className={styles.cafeTitle}>
                {cafeLetters.map((char, index) => (
                  <span
                    key={`cafe-${index}`}
                    className={styles.letter}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className={styles.peregrinoTitle}>
                {peregrinoLetters.map((char, index) => (
                  <span
                    key={`peregrino-${index}`}
                    className={styles.letter}
                    style={{ animationDelay: `${(cafeLetters.length + index) * 0.05}s` }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.badge}>
              {matchedDiscount.discount}% OFF
            </div>

            <p className={styles.successText}>
              {matchedDiscount.text}
            </p>
            <p className={styles.successSubtext}>
              {matchedDiscount.subtext}
            </p>

            <div className={styles.ctaWrapper}>
              <a
                href={buildWhatsAppLink(matchedDiscount.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
                onClick={() => sendGAEvent('event', 'whatsapp_redirection', { value: 'promo' })}
              >
                Ir a redimir mi descuento
              </a>
              <Link href="/" className={styles.homeLink}>
                Para saber más sobre nosotros
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
```

Note what changed vs. the current file: `HeroRipple` and `gsap` imports added; a new `entryRef` + GSAP entrance `useEffect`; the entry JSX now nests inside `.entryState` → `.entryContent` → (`.origin`, `.brandName` as `<h1>`, `.entryBadge`, `.formContainer` as `<h2>`-titled card); the success JSX is unchanged except its new `.successState` outer wrapper (replacing the old shared `.pageContainer`); the inline `style={{ marginTop: '2rem' }}` on the entry state's home link is replaced by the `.homeLinkOnDark` class.

- [ ] **Step 2: Replace `src/app/promo/Promo.module.css` with the restyled version**

Replace the full file contents:

```css
/* ============================================
   Entry State (matches Hero's navy + ripple)
   ============================================ */
.entryState {
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

.entryContent {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  max-width: var(--max-width-narrow);
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

.entryBadge {
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

@media (max-width: 768px) {
  .entryState {
    padding: var(--space-xl) var(--space-sm) var(--space-lg);
  }
}

/* ============================================
   Input Form Card
   ============================================ */
.formContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  width: 100%;
  gap: var(--space-sm);
  margin-top: 1rem;
  background: rgba(245, 239, 234, 0.04);
  border: 1px solid rgba(245, 239, 234, 0.1);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg) var(--space-md);
}

.inputTitle {
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  color: #fff;
  margin-bottom: var(--space-xs);
}

.inputDescription {
  font-size: var(--fs-body);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--space-md);
}

.inputWrapper {
  width: 100%;
  position: relative;
}

.discountInput {
  width: 100%;
  padding: 1rem 1.5rem;
  font-family: var(--font-body);
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--navy);
  background: #fff;
  border: 2px solid var(--cream-dark);
  border-radius: var(--border-radius-lg);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.discountInput::placeholder {
  color: #ccc;
  letter-spacing: normal;
}

.discountInput:focus {
  border-color: var(--magenta);
  box-shadow: 0 0 0 4px var(--magenta-glow);
}

.discountInput.error {
  border-color: #e63946;
}

.discountInput.shaking {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

.errorMessage {
  color: #e63946;
  font-size: var(--fs-small);
  font-weight: 600;
  margin-top: 0.5rem;
  height: 20px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.errorMessage.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* ============================================
   Success State (unchanged, cream contrast)
   ============================================ */
.successState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-md);
  background-color: var(--cream);
  text-align: center;
  overflow: hidden;
  position: relative;
}

.successContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  width: 100%;
  animation: fadeUp 0.6s var(--ease-out) forwards;
  z-index: 10;
}

.imageWrapper {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-md);
  animation: float 6s ease-in-out infinite;
}

.speechBubble {
  position: absolute;
  top: -20px;
  right: -40px;
  background: #fff;
  color: var(--magenta);
  font-family: var(--font-display);
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px 20px 20px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(0);
  transform-origin: bottom left;
  animation: popScale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards;
  z-index: 2;
}

.speechBubble::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  border-width: 10px 10px 0 0;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

.personajeImage {
  width: 300px;
  height: 300px;
  object-fit: cover;
  mix-blend-mode: multiply;
}

.titleContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-sm);
  line-height: 0.9;
}

.cafeTitle {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--orange);
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.peregrinoTitle {
  font-family: var(--font-display);
  font-size: clamp(5em, 6vw, 5rem);
  color: var(--navy);
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.letterSpace {
  width: 0.3em;
  /* Space width */
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--magenta);
  color: #fff;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  padding: 0.75rem 2.5rem;
  border-radius: 100px;
  border: 4px solid var(--cream);
  margin-bottom: var(--space-md);
  box-shadow: 0 8px 25px rgba(247, 37, 133, 0.4);
  transform: scale(0);
  animation: popScale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards;
}

.successText {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--text-dark);
  line-height: 1.6;
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 1s forwards;
}

.successSubtext {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text-dark);
  opacity: 0;
  animation: fadeIn 0.8s var(--ease-out) 1s forwards;
}

.ctaWrapper {
  margin-top: var(--space-lg);
  opacity: 0;
  font-size: 1rem;
  animation: fadeIn 0.8s var(--ease-out) 1.5s forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.homeLink {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--navy);
  text-decoration: underline;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.homeLink:hover {
  opacity: 0.7;
}

.homeLinkOnDark {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-underline-offset: 3px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: var(--space-sm);
}

.homeLinkOnDark:hover {
  opacity: 1;
  color: #fff;
}

/* ============================================
   Keyframes
   ============================================ */
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-15px);
  }

  100% {
    transform: translateY(0px);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes popScale {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

Note what changed vs. the current file: the old `.pageContainer` block is replaced by `.successState` (identical declarations, new name); `.entryState`/`.entryContent`/`.origin`/`.brandName`/`.entryBadge`/`.homeLinkOnDark` are new (copied from `Hero.module.css`'s token values, not its classes, per this CSS module's own file); `.formContainer` gains the translucent-card background/border/padding and drops its now-unneeded `z-index: 10` (superseded by `.entryContent`'s `z-index: 2` stacking above the ripple); `.inputTitle`/`.inputDescription` are recolored for the dark card. Everything from `.successContainer` down is byte-for-byte unchanged.

- [ ] **Step 3: Verify with lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev`, open http://localhost:3000/promo

Expected on the entry screen (desktop width ≥768px):
- Navy background fills the viewport; moving the mouse over the page spawns magenta/orange ripple circles (same effect as the homepage Hero).
- "Café Peregrino" renders in large display type above a "Código de Descuento" pill badge, both fading/sliding in on load along with the origin line and the form card (staggered entrance).
- The card below shows "Desbloquea tu Descuento", the description, the 6-digit input, and the "Para saber más sobre nosotros" link in light text on the translucent card.
- Typing 6 characters that don't match a real code triggers the shake animation and shows "Código no válido. Intenta de nuevo." in red, still legible against the card.
- Typing a valid 6-character code (check `src/lib/discounts.ts` for a live `discount_code` to use) transitions to the success screen: cream background, mascot with speech bubble, letter-by-letter "Café Peregrino" title, discount badge, body copy, and the WhatsApp CTA — all identical to current production behavior.

Resize to mobile width (<768px) and reload:
- Entry screen padding reduces per the `@media (max-width: 768px)` rule, no horizontal scroll, ripple layer stays confined to the viewport (pointer-move ripples don't fire on touch, which is expected — `HeroRipple` only responds to `pointerType === "mouse"`).
- Success screen is unaffected (its layout didn't change).

- [ ] **Step 5: Commit**

```bash
git add src/app/promo/page.tsx src/app/promo/Promo.module.css
git commit -m "$(cat <<'EOF'
feat: restyle promo entry screen to match Hero's navy/ripple look

Wraps the code-entry form in the same origin-line/brand-heading/badge
header and translucent card treatment as the homepage Hero, reusing
HeroRipple as-is. The success (discount-revealed) screen is unchanged,
kept on its cream background as a deliberate contrast.
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** Entry-state navy+ripple background (Step 2 `.entryState` + `HeroRipple` reuse), origin/brand/badge header (Step 1 JSX + Step 2 `.origin`/`.brandName`/`.entryBadge`), form card reusing Hero's `.column` treatment (Step 2 `.formContainer`), entrance GSAP animation mirroring `Hero.tsx` (Step 1 `entryRef` effect), success state left untouched on cream (Step 1 success JSX unchanged, Step 2 `.successState`/`.successContainer`-down unchanged), no API/logic changes (Step 1 keeps `checkCode`/`handleInputChange`/`setError` verbatim) — all covered by the single task above.
- **Placeholder scan:** none — both files are given as complete, copy-pasteable contents; verification steps list concrete expected behavior instead of "add tests."
- **Type consistency:** `HeroRipple` is imported with no props (matches its actual signature — a parameterless component). `DiscountResult` fields used (`discount`, `text`, `subtext`, `whatsapp_message`) match `src/lib/discounts.ts`. `buildWhatsAppLink(message: string)` call matches `src/lib/whatsapp.ts`. Class names referenced in JSX (`entryState`, `entryContent`, `origin`, `brandName`, `entryBadge`, `formContainer`, `inputTitle`, `inputDescription`, `inputWrapper`, `discountInput`, `error`, `shaking`, `errorMessage`, `visible`, `homeLink`, `homeLinkOnDark`, `successState`, `successContainer`, `imageWrapper`, `speechBubble`, `personajeImage`, `titleContainer`, `cafeTitle`, `peregrinoTitle`, `letter`, `badge`, `successText`, `successSubtext`, `ctaWrapper`) all have matching definitions in the Step 2 CSS.
