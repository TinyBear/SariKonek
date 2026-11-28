# SariKonek

A mobile ordering app for sari-sari stores. Customers scan a store's QR code, browse its stock, and place pickup orders. Store owners manage inventory and fulfil orders.

## Stack
- **Mobile:** Expo (React Native + TypeScript), Expo Router
- **API:** ASP.NET Core Web API (.NET 10), Identity + JWT, EF Core + Npgsql
- **Database:** Neon PostgreSQL
- **Hosting:** Render (Docker)

## Structure
- `SariKonek.API/` - backend
- `SariKonek.Mobile/` - Expo app

## Local development
Setup instructions are added as each phase is completed.

## For UI contributors

1. Install Node LTS and the **Expo Go** app on your phone.
2. Clone the repo, then:
   ```bash
   cd SariKonek.Mobile
   npm install
   cp .env.example .env   # PowerShell: Copy-Item .env.example .env
   ```
3. Set `EXPO_PUBLIC_API_URL` in `.env` (ask the backend owner for the current URL).
4. Run `npx expo start --tunnel -c` and scan the QR code with Expo Go.

### Where to work
- Screens live in `src/app/`. Each screen has a `LOGIC (keep)` block (hooks and handlers) and a `PLACEHOLDER UI (replace)` block (JSX and styles). Replace only the UI block.
- Shared state: `useAuth()` in `src/context/AuthContext.tsx`, `useCart()` in `src/context/CartContext.tsx`.
- Do not add navigation calls after login or logout. `src/app/_layout.tsx` redirects by role automatically.
- Types are in `src/types/index.ts`.
