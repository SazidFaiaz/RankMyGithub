# GitRate

GitRate turns publicly visible GitHub profile and repository data into a transparent profile score and useful context. It is an independent project, not affiliated with GitHub, and the score is not a measure of programming ability.

## Current implementation

The first vertical slice includes a responsive homepage, username/profile-URL search, public profile reports, deterministic versioned scoring, six score categories with evidence, repository summaries, shareable profile URLs, profile comparisons, and a dynamically generated SVG badge. Public profile and repository data are fetched on the server with Octokit. The score is always calculated server-side.

The GitHub public REST API does not expose reliable contribution graph totals through the endpoints used here. GitRate labels commit/review/merged-PR totals unavailable instead of inventing values. Repository data is limited to the 100 most recently updated public repositories. README presence is not fetched in this phase and is explicitly excluded as a known signal.

## Stack

- Web: React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Lucide
- API: Node.js, Express, TypeScript, Octokit, Zod, Helmet, express-rate-limit
- Business logic: isolated scoring-engine workspace with deterministic unit tests
- Persistence/auth: Mongoose is installed for the next phase; this slice uses an in-process cache and does not require MongoDB

## Requirements

- Node.js 22+
- npm 10+

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`; the API listens on `http://localhost:5000`. `GITHUB_TOKEN` is optional locally, but unauthenticated GitHub access is limited to 60 API requests per hour per IP. Set it only in the server environment to increase the limit; never expose it through a `VITE_` variable.

## Root commands

```sh
npm run dev
npm run build
npm test
npm run lint
npm run typecheck
```

## API

- `GET /api/health`
- `GET /api/github/:username`
- `GET /api/github/:username/repositories`
- `GET /api/github/:username/activity`
- `GET /api/analysis/:username` (also accepts a GitHub profile URL)
- `GET /api/compare/:username1/:username2`
- `GET /api/badge/:username` (SVG)

Responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code": ..., "message": ... } }`.

## Scoring

The deterministic v1 algorithm totals 1,000 points: Projects (150), Activity & Consistency (350), Community Impact (300), Social Influence (100), Languages (50), and Account Longevity (50). Large counts use logarithmic normalization. Forked repositories do not add to original project counts, and HTML/CSS/Markdown do not add language-diversity points. See [docs/scoring.md](docs/scoring.md).

## Environment variables

See [.env.example](.env.example). Keep production secrets in the host's environment settings and never commit `.env`.

## Deployment and roadmap

`vercel.json` and the serverless Express entry are an initial deployment scaffold, not evidence of a completed production deployment. The process-local cache is not shared across instances. MongoDB-backed caching, authentication/saved profiles, SEO-rendered public routes, sitemap, and deployment smoke testing remain follow-up phases. See [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md), and [docs/deployment.md](docs/deployment.md).