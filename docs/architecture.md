# Architecture

GitRate uses npm workspaces. `apps/web` owns presentation and client routes; `apps/api` owns public GitHub access, response normalization, validation, and HTTP security; `packages/scoring-engine` contains framework-independent deterministic scoring.

The browser calls the API and never receives a GitHub token. The API calls GitHub through Octokit, maps provider responses to internal profile/repository metrics, caches results in-process for 30 minutes, and computes the score on the server. The browser uses TanStack Query for a five-minute client cache. API and browser response types are explicit rather than raw GitHub payloads.

The analysis cache is intentionally process-local in this first slice. It is useful for local development but is not a durable/shared production cache; MongoDB persistence and stale-while-revalidate behavior remain follow-up work. Auth, database persistence, monitoring, and metadata rendering must be completed before claiming the production requirements in the specification.