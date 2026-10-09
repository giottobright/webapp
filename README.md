# HayalKız Mini App

React 18 + Vite Telegram Mini App for the HayalKız bot: persona catalog, gift shop (free and
Telegram Stars gifts), subscriptions, referrals and profile. UI languages: Russian, Turkish, English
(picked from the Telegram user's language).

## Commands

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # vitest + Testing Library
npm run build      # production build in dist/
```

## Configuration

Copy `.env.example`:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Backend URL. Empty: `app.example.com` → `api.example.com`, localhost → `:8000` |
| `VITE_ASSETS_BASE` | Optional CDN with persona originals; bundled WebP photos are used first |
| `VITE_DEV_USER_ID` | **Dev only**: act as this Telegram user outside Telegram (backend with `ENV=dev DEV_BYPASS_INIT_DATA=1`) |

## How it talks to the backend

- Every request goes through `apiFetch()` (`src/utils/api.js`) and carries
  `X-Telegram-Init-Data: <Telegram.WebApp.initData>`; the backend verifies the signature and takes the
  user from it. No user id is ever put into URLs or bodies (`/api/profile/me`, `/api/referral/me`, …).
- Telegram provides initData when the app is opened from an **inline button, the menu button or a
  direct link**; the bot opens it that way. From a reply-keyboard button initData is empty — the app then
  only supports persona choice via `sendData`.
- Payments: `POST /api/subscription/invoice` or `/api/gifts/invoice` returns an invoice link, the app
  opens it with `Telegram.WebApp.openInvoice` and the bot activates the purchase on `successful_payment`.
- Plans and persona cards come from `/api/plans` and `/api/personas` (local `src/personas.js` is the
  offline fallback).
- Deep links: `?tab=shop&persona=elif` or `start_param=shop_elif` open the shop for a persona.

## Deploy

- **Netlify**: connect the repo; `netlify.toml` runs tests and the build, publishes `dist/`.
  Set `VITE_API_BASE` in the site environment.
- **Docker / TimeWeb**: `docker build --build-arg VITE_API_BASE=https://api.example.com -t hayalkiz-webapp .`
  (nginx, SPA fallback, immutable hashed assets).

Then put the URL into the backend `WEBAPP_URL` and into BotFather (Menu Button / Configure Mini App).

## Structure

| Path | What |
|---|---|
| `src/App.jsx` | tab state, persona selection, deep links |
| `src/i18n.js` | all UI strings (ru/tr/en, identical keys — tested) |
| `src/utils/api.js` | `apiFetch`, Telegram helpers, `openInvoice`, photos |
| `src/components/*` | pages: GiftShop (+MyGifts), PremiumPage, ProfilePage, ReferralsPage, persona card/detail |
| `photo/*.webp` | persona photos (960 px WebP, ~1 MB total) |
| `src/test/*` | unit and component tests |
