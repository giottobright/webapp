# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HayalKız webapp — React 18 + Vite Telegram Mini App: persona catalog, gift shop, subscriptions (Telegram Stars),
referrals, profile. UI languages ru/tr/en.

Backend, project status and decisions live in the private `back` repo: `back/docs/PROJECT_STATUS.md`,
`back/docs/ARCHITECTURE.md` (Mini App auth and payment flows are in §4–5). Deliver changes via branches + PRs to `master`.

## Commands

```bash
npm ci
npm run dev      # Vite dev server
npm test         # vitest (jsdom) + Testing Library
npm run build    # production build to /dist
```

## Rules

- All backend calls go through `apiFetch()` in `src/utils/api.js` (adds `X-Telegram-Init-Data`). Never send a
  user id in a URL or body — use `/me` routes; the backend derives the user from verified initData.
- Use `insideTelegram()` to decide whether authenticated calls are possible; show `common.openInTelegram` otherwise.
- Payments: get an invoice link from the API, open it with `openInvoice()`; never use `sendData` for payments.
- Every UI string lives in `src/i18n.js` with the same key in ru, tr and en (a test enforces it). Use `t(lang, key, vars)`.
- Persona data: `/api/personas` with `src/personas.js` as fallback (same shape: `name: {ru,tr,en}`); `localizePersona()`.
- `import.meta.glob` must be called literally (no runtime checks) — Vite rewrites it at build time.

## Architecture

No router: tab state in `App.jsx` (`girls`, `shop`, `referrals`, `profile`, `premium`), start tab from
`getStartParams()` (`?tab=shop&persona=elif` or `start_param`). Photos: `photo/<code>1.webp`, `<code>2.webp`.

## Design system

- Styles: single `src/styles.css`, tokens in `:root` (`--bg`, `--surface-1..3`, `--ink`/`--ink-2`/`--ink-3`,
  `--rose*` for actions, `--gold*` for Stars/VIP, `--green*` for online/success). Use tokens, not raw colors.
- Fonts are self-hosted via `@fontsource` in `src/main.jsx`: Cormorant Garamond (display, ≥22px only) + Onest (UI).
  Both cover Cyrillic and Turkish — do not switch to a font without those subsets.
- Icons: `lucide-react` (stroke 1.75 via `LucideProvider`); no emoji as UI icons or inside button labels.
  Gift emoji from the API are content and stay.
- Shared pieces in `src/components/ui.jsx` (`Segmented`, `ChipRow`, `PersonaAvatar`, `EmptyState`, `ErrorState`,
  `Skeleton`, `StarsIcon`); modal UI goes through `Sheet.jsx` (portal, Escape/backdrop/Telegram BackButton, focus trap).
- Every data screen has loading (skeleton), empty and error-with-retry states. Touch targets ≥40px, text ≥12px.
- Telegram API calls newer than 6.0 are gated with `tgSupports(version)`; safe areas come from
  `--tg-safe-area-inset-*` / `--tg-content-safe-area-inset-*` (see `--sat`/`--sab`).
- Motion: transform/opacity, `--ease-out`; `prefers-reduced-motion` keeps fades and drops travel.

## Environment

`VITE_API_BASE` (backend), `VITE_ASSETS_BASE` (optional CDN), `VITE_DEV_USER_ID` (dev only, requires backend
`ENV=dev DEV_BYPASS_INIT_DATA=1`).
