# Happy Birthday Alyse

A Next.js birthday landing page converted from the original `index.html`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. *(Optional)* Replace the CSS bottom decoration with custom artwork:

   - Add `public/assets/party-cats.webp` (or `.png`) if you have the illustration
   - Swap the `party-art-fallback` div in `src/app/page.tsx` back to an `<img>` (see comment in that file)

   A CSS celebration fallback is active by default — no asset required for the page to load.

   The nav logo (`party-cat-logo.webp`) is in the repo.
3. Provision Convex (first time only):

```bash
# PowerShell (Windows)
$env:CONVEX_AGENT_MODE="anonymous"; npx convex dev --once

# macOS / Linux
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

This creates `.env.local` with `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT`.

4. Start the dev server (Next.js + Convex watcher):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Convex watcher + Next.js dev server
- `npm run dev:frontend` — Next.js only
- `npm run dev:convex` — Convex watcher only
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run ESLint
