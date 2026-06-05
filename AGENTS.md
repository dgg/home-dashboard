# AGENTS.md

## Project
Household energy dashboard - static SPA deployed to GitHub Pages.
No backend, no build step, no bundler. Vanilla ES modules served directly.

## Stack
- **Charts** ChartJs (`chartjs/chart.js`) v4.5.1 (CDN)
- **UI** Tabler (`tabler/tabler`) v1.4.0 (CDN)
- **Hosting** GitHub Pages, served from `/public` on `main`
- **Data** several external APIs, fetched client-side at runtime

Use context7 to fetch library docs

## Data sources
| Source | What it provides | Refresh cadence |
|---|---|---|
| `https://api.energidataservice.dk/dataset/DayAheadPrices` | DK1 spot prices (EUR/MWh) | Once daily, published ~13:15 CET - poll after that |
| `https://api.forecast.solar/estimate/:lat/:lon/:dec/:az/:kwp` | Hourly solar generation forecast (Wh) | Every 4-6 hours |
| `https://api.open-meteo.com/v1/forecast?latitude=&longitude=&daily=sunrise,sunset&hourly=direct_radiation,diffuse_radiation,global_tilted_irradiance&timezone=Europe%2FBerlin&past_days=0&forecast_days=3&tilt=&azimuth=` | Hourly solar radiation forecast (W/m2) | Every 4-6 hours |

Endpoints are HTTPS and CORS-enabled. No API keys required.

## Repo layout
```
public/
	index.html		# single entry point
	styles/			# Tabler overrides, kiosk layout
	scripts/
		app.js		# wires all modules: api, charts, ...; loaded as type="module"
		api/		# fetch + normalise information from different APIs
		charts/		# configuration and data rendering
data/				# examples of api responses and development mocks
```

## Module contracts

files from `api/` must return a plain object with consistent shape.
Charts must not import from `api/`. `app.js` is the only cross-layer importer.

## Coding rules
- ES modules throughout (`type="module"`). No CommonJS, no bundler.
- No TypeScript. No framework. No npm.
- All external resources loaded from CDN over HTTPS.
- `const` by default; `let` only when reassignment is needed.
- No `var`, no global state outside `app.js`.
- Errors from API fetches must be caught and surfaced in the UI - never silently swallowed.

## Scheduling behaviour
- Electricity prices: schedule one fetch per day, no earlier than 13:15 CET.
- Solar forecast: fetch on load, then every 6 hours.
- Use `Date` arithmetic only - no external date libraries.
- On fetch failure, retry once after 5 minutes, then stop until next scheduled window.

## GitHub Pages
- Pages is configured to deploy static asserts from `public/` via action
- `index.html` must work when opened directly from `file://` for local testing.

## What agents should not do
- use inline `style` attributes
- create a lot of custom styles when tabler provides classes (prefer overriding)
- Do not introduce a build step, bundler, or package.json without explicit instruction.
- Do not add a backend, proxy, or serverless function.
- Do not add a JS framework (React, Vue, Svelte, etc.).
- Do not store API responses in localStorage - keep all state in memory.
- If adding interactivity, ensure the script runs after DOM ready (`DOMContentLoaded`).
- Do not modify the normalised data shapes without updating both the api module and this file.

## Source control
- use conventional commits
- use feature branches
