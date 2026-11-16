# Station Atlas

A small, community-maintained web app for finding train stations by the facilities that actually matter when you travel — warm places to sleep, power outlets, toilets, WiFi and 24/7 access. Search tolerates typos, results are shareable URLs, and everything is built on open data plus what travelers report from experience.

## Features

- **Fuzzy station search** (PostgreSQL `pg_trgm`) by station name or city, with instant amenity filters, sorting, and recent searches kept on the device.
- **Station detail pages** with an at-a-glance amenity overview, community photos, operational identifiers (DS100, EVA, RIS/IRIS), and links to maps and platform plans.
- **Favorites** stored in local storage — no account required.
- **Community contributions**: signed-in users submit edits; administrators review them before they go live.
- **Installable PWA** with a service worker and an unobtrusive install hint.

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 runes, TypeScript and Tailwind CSS 4
- [Drizzle ORM](https://orm.drizzle.team/) on PostgreSQL, with [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) fuzzy search
- Google OAuth for sign-in, sessions stored in PostgreSQL
- [`@sveltejs/adapter-vercel`](https://svelte.dev/docs/kit/adapters) and [`@vite-pwa/sveltekit`](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html)
- [Bun](https://bun.sh/) as the package manager and runtime; [Vitest](https://vitest.dev/) for tests

## Getting started

Install dependencies with `bun install`. The app needs a PostgreSQL database with the `pg_trgm` extension and the migrations in `drizzle/` applied. Create a `.env` file with the private values used by [src/lib/server/db.ts](src/lib/server/db.ts) and [src/lib/server/auth.ts](src/lib/server/auth.ts):

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/stations
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google
```

`DATABASE_URL` and the Google variables are imported as SvelteKit static private env, so they must be present when you start the dev server or run a build.

Then:

```bash
bun run dev      # start the dev server
bun run build    # production build
bun run preview  # preview the production build
bun run test     # unit tests
bun run lint     # prettier + eslint
```

## Project structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          reusable primitives (Button, Card, Badge, …)
│   │   ├── shell/       app chrome (header, footer, install hint, cookies)
│   │   └── station/     station cards, photo views and amenity panels
│   ├── design/          design tokens: surfaces, tones, control styles
│   ├── features/
│   │   ├── favorites/   local-storage favorites state
│   │   └── stations/    amenity definitions, categories, link behavior
│   ├── server/          database client, schema and authentication
│   ├── types.ts         shared station types
│   └── utils/           small helpers
├── routes/              SvelteKit routes; auth/admin routes use groups
├── app.css              global styles, theme and motion
└── service-worker.js    PWA precache
```

`docs/STATION_DATA_SOURCES.md` records where station data comes from and the terms attached to each source. The `tools/` directory holds one-off import and migration scripts for that data; they are not part of the running app.

## Data and privacy

Station infrastructure data comes from DB InfraGO OpenStation and the Bahn-Vorhersage stations dataset; photos come from Railway-Stations.org. Contributions are reviewed before publication. The app does not run third-party analytics or advertising. See the in-app privacy policy for details.

## License

The source code is open; station data and photos remain subject to the terms of their respective sources (see `docs/STATION_DATA_SOURCES.md`).
