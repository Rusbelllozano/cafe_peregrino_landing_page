# Promo Page — Hero-Style Redesign

**Date:** 2026-08-19
**Status:** Approved

## Goal

Restyle `/promo` (the discount-code redemption page) so its code-entry
screen looks and feels like a sibling of the main `Hero` section, while
keeping the page scoped to exactly one job: capturing and validating a
6-digit discount code. No new content, no navigation, no product info —
just the same visual language as the homepage's Hero.

## Context

`Hero.tsx` was rebuilt (PR #5, merged into `main`) from a full-bleed photo
background into a navy solid background with an interactive `HeroRipple`
layer (magenta/orange circles that follow the mouse), a small uppercase
origin line, a large `.brandName` display heading ("Café Peregrino"), a
pill badge, and translucent bordered cards (`.column`) for each product.

`/promo` (`src/app/promo/page.tsx` + `Promo.module.css`) currently has two
conditional states rendered from one cream-background `.pageContainer`:

- **Entry state** (`!matchedDiscount`): plain cream background, a
  centered form with a 6-digit input (uppercase, auto-checks at length 6,
  shakes + shows an error message on an invalid code via `POST
  /api/promo`), and a "Para saber más sobre nosotros" link back to `/`.
- **Success state** (`matchedDiscount`): a celebratory reveal — animated
  mascot image with a speech bubble, a letter-by-letter "Café Peregrino"
  title, a discount-percentage badge, body copy, a WhatsApp CTA
  (`cta-button`, fires `whatsapp_redirection` GA event with
  `value: 'promo'`), and the same home link.

None of the validation logic, the `/api/promo` route, or the
`DiscountResult` shape changes in this redesign — only the entry state's
visual treatment, and light structural changes to let each state own its
own background.

## Design

### Entry state — restyled to match Hero

Replace the cream background with the same navy + ripple treatment as
`Hero`, reusing the existing `HeroRipple` component as-is (imported from
`@/components/Hero/HeroRipple`, not duplicated). Content stacks in the
same hierarchy as `Hero`:

1. **Origin line** — same copy and style as `Hero`'s `.origin`
   ("Regiones Montañosas del Meta · 1200 - 1600 msnm"), green-lime,
   uppercase, wide letter-spacing.
2. **Brand heading** — "Café Peregrino" using the same `.brandName`
   treatment (large `font-display`, white).
3. **Badge** — same pill style as `Hero`'s `.badge`, copy changed to
   "Código de Descuento" (promo-relevant instead of the scarcity message).
4. **Form card** — a single centered card reusing the `Hero` `.column`
   treatment (translucent panel, subtle border, rounded corners)
   containing:
   - Subtitle "Desbloquea tu Descuento" (`.productName`-style: white,
     `font-display`, `--fs-h2`)
   - Description text (white/70%, `.tagline`-style)
   - The existing 6-digit input, unchanged functionally — recolored so
     it still pops as an action element against navy (kept as a light
     input field with the existing magenta focus glow and red
     error/shake state, both already legible on a dark surrounding card)
   - The existing error message, unchanged
   - "Para saber más sobre nosotros" link, restyled to match `Hero`'s
     `.detailsLink` (white/70%, underline, small uppercase)

**Entrance animation:** add the same inline GSAP pattern `Hero.tsx` uses
— a `gsap.context` in a `useEffect`, `gsap.fromTo` with opacity/y stagger
on a shared class (e.g. `.promo-anim`) applied to the origin line, brand
heading, badge, and card, cleaned up via `ctx.revert()`. This mirrors
`Hero`'s inline pattern rather than the shared `useGsap` hooks, per the
existing convention that `Hero` and `CTA` build GSAP inline.

### Success state — unchanged, kept as visual contrast

No functional or visual changes to the success state: mascot, speech
bubble, letter-by-letter title, discount badge, body copy, WhatsApp CTA,
and home link all stay exactly as they are today, on the existing cream
background. This is a deliberate contrast — the dark, ripple-driven entry
screen gives way to a bright "reward revealed" screen once a valid code
is entered.

### Structural change

Today both states render from one shared `.pageContainer` (always cream).
Split the background ownership so each state controls its own:

- Entry state renders inside a new wrapper (e.g. `.entryState`) carrying
  the navy background, `HeroRipple`, `min-height: 100dvh`, and centering
  — effectively `Hero`'s `.hero` container shape.
- Success state renders inside a wrapper (e.g. `.successState` or the
  existing `.successContainer`'s parent) that keeps the current cream
  background and centering.

This is a rendering-container change only — the existing conditional
`{!matchedDiscount && ...}` / `{matchedDiscount && ...}` structure in
`page.tsx` stays the same, just with each branch's outer wrapper now
carrying its own background instead of sharing one.

### What does not change

- `POST /api/promo` route and `DiscountResult` type — untouched.
- Code validation logic (`checkCode`, `handleInputChange`, error/shake
  timing) — untouched.
- WhatsApp CTA behavior and GA event tracking (`value: 'promo'`) —
  untouched.
- Success-state markup, copy, and animations — untouched.
- No navbar is added; the page remains a standalone entry point as it is
  today.

## Files touched

- `src/app/promo/page.tsx` — wrap entry state in the new dark container,
  add the GSAP entrance effect, apply the origin/brand/badge markup, wrap
  the form in the card.
- `src/app/promo/Promo.module.css` — add the navy/ripple entry container
  styles (reusing `Hero.module.css` token values, not the classes
  themselves, since `Promo.module.css` is its own CSS module per the
  one-file-per-component convention), restyle `.inputTitle` /
  `.inputDescription` / `.homeLink` for the dark surface, add the card
  wrapper style.
- No changes to `src/components/Hero/*` — `HeroRipple` is imported and
  used as-is.

## Testing / verification

No test suite exists in this repo. Verification is manual:

- `npm run lint` — no errors.
- `npm run dev` — check at desktop width:
  - Entry screen matches Hero's navy/ripple/typography treatment;
    ripple follows the mouse.
  - Typing an invalid 6-character code triggers the shake + error
    message, still legible on the dark card.
  - Typing a valid code transitions to the existing cream success
    screen with no regressions (mascot animation, badge, WhatsApp CTA
    link, GA event).
- Resize to mobile width (<768px): entry screen stacks/pads correctly,
  no horizontal scroll, ripple layer still confined to the viewport.
