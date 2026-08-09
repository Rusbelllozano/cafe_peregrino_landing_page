# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint      # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

There is no test suite or test runner configured in this repo.

## Architecture

Next.js **16.2.4** App Router + React **19.2.4**, TypeScript, plain CSS Modules (no Tailwind/UI kit). This Next.js version is newer than the assistant's training data and has breaking API/convention changes — per `AGENTS.md`, check `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`) before using any Next.js API you aren't sure about, especially `next/image` and routing/caching behavior.

### Structure

- `src/app/page.tsx` — the single landing page, composed by stacking section components in order: `Navbar → Hero → Products → Story → CTA → Footer`. No other page-level logic lives here.
- `src/app/layout.tsx` — root layout. Loads three `next/font/google` fonts (Bebas Neue, Montserrat, Pacifico) as CSS variables and mounts `GoogleAnalytics` from `@next/third-parties/google` with a hardcoded `gaId`.
- `src/app/promo/page.tsx` — standalone client-rendered promo/discount-code redemption page, unrelated to the main landing flow. Valid codes live in an in-file `DISCOUNT_DATABASE` array (no backend/API routes exist anywhere in the project — this is a fully static site).
- `src/components/<Name>/` — each section is a pair: `<Name>.tsx` (client component, `"use client"`) + `<Name>.module.css`. There is no shared component library; each section owns its own styles.
- `src/hooks/useGsap.ts` — shared GSAP scroll-animation hooks (`useGsapFadeUp`, `useGsapParallax`, `useGsapReveal`), all built on `gsap.context()` + `ScrollTrigger`, cleaned up via `ctx.revert()` in a `useEffect` return. Prefer these over hand-rolling new GSAP setup in a component; several components (e.g. `Hero`, `CTA`) still register `ScrollTrigger` and build `gsap.context` blocks inline instead of using the hook — follow that inline pattern only if the hook genuinely doesn't fit.
- `src/app/globals.css` — design tokens as CSS custom properties (`--magenta`, `--orange`, `--navy`, spacing scale, fluid `clamp()` type scale, easing/duration tokens) plus a global `.cta-button` class reused by every WhatsApp CTA. Component `.module.css` files consume these tokens via `var(--token)` rather than redefining values.
- `prompts/init_prompt.md` — Spanish-language brand/business reference doc (identity, product specs, copy, pricing, marketing strategy). Not code, but the source of truth for any content/copy changes to the landing page.

### Conventions specific to this codebase

- **WhatsApp CTAs**: every CTA links to `https://wa.me/<number>?text=<prefilled message>` and fires `sendGAEvent('event', 'whatsapp_redirection', { value: '<location>' })` on click (`value` identifies the CTA's location: `navbar`, `hero`, `cta`, `promo`, etc.). Any new CTA should follow this exact pattern so GA tracking stays consistent. The WhatsApp number is currently duplicated as a literal string across `Navbar`, `Hero`, `CTA`, and `promo/page.tsx` rather than centralized.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Section components use plain anchor-scroll navigation (`#hero`, `#productos`, `#origen`, `#combo`), not routing — `page.tsx` and the section `id`s must stay in sync with `Navbar` link targets.
