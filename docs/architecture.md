# Architecture

GitRate is a single Next.js App Router application deployed as one Vercel project. `app/` owns public pages and API Route Handlers; `components/` owns interactive React UI; `lib/` owns server-side GitHub integration, response normalization, API behavior, and rate limiting; `packages/scoring-engine` owns deterministic business logic.

The browser never receives a GitHub token. Server components and route handlers share the Octokit-backed profile service, normalize provider responses, keep a bounded best-effort process cache, and calculate scores on the server. Public profile and comparison pages use App Router metadata and server rendering. There is no separate Express process, Vite application, or MongoDB requirement.

The in-memory cache and limiter are per server process and are not shared across Vercel instances. Use a shared store if traffic requires globally consistent caching or rate limits. Authentication and user persistence are intentionally not part of this first Next deployment slice.