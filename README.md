# GitRate

GitRate turns publicly visible GitHub profile and repository data into a transparent profile score and useful context. It is an independent project, not affiliated with GitHub, and the score is not a measure of programming ability.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Next.js Route Handlers for the API and dynamic SVG badge
- Octokit for server-side GitHub REST access; Zod validation
- A separate deterministic scoring-engine workspace
- TanStack Query for browser caching

This is one deployable Next.js application. There is no separate Express server, Vite build, or MongoDB requirement.

## Local setup

Requirements: Node.js 20.9+ and npm 10+.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. `GITHUB_TOKEN` is optional for local development, but unauthenticated GitHub API access is limited to 60 requests per hour per IP. Keep tokens server-side; never expose them through a `NEXT_PUBLIC_` variable.

## Commands

```sh
npm run dev
npm run build
npm test
npm run lint
npm run typecheck
```

## Features and API

- Homepage username and GitHub profile URL analysis
- Server-rendered public profile pages and metadata at `/github/:username`
- Shareable side-by-side comparisons at `/compare/:username-vs-:username`
- Six-category GitHub profile score, evidence, recent repositories, and dynamic README badge
- `GET /api/health`
- `GET /api/analysis/:username`
- `GET /api/github/:username`, `/repositories`, and `/activity`
- `GET /api/compare/:username1/:username2`
- `GET /api/badge/:username`

API responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code": ..., "message": ... } }`. Commit totals and contribution weeks are reported unavailable where GitHub's public REST API does not provide reliable data.

## Scoring and environment

The deterministic, versioned v1 algorithm totals 1,000 points across Projects (150), Activity & Consistency (350), Community Impact (300), Social Influence (100), Languages (50), and Account Longevity (50). See [docs/scoring.md](docs/scoring.md). Environment settings are listed in [.env.example](.env.example); production secrets belong in Vercel's project settings.

## Deploy to Vercel

Import this repository into Vercel; it detects Next.js and uses the root build automatically. Add `GITHUB_TOKEN` as a server-only environment variable if you need higher GitHub API limits, then deploy. The project is configured in [vercel.json](vercel.json). The process-local GitHub cache is best-effort across serverless instances; persistent shared caching is future work.

See [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md), and [docs/deployment.md](docs/deployment.md) for details.