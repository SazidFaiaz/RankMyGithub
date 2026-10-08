# Deployment

Import the repository into Vercel as a Next.js project. The root `package.json` supplies `npm run build`; Vercel serves App Router pages and API Route Handlers from the same deployment. Configure Node.js 20.9+ and add `GITHUB_TOKEN` only as a server-side environment secret if authenticated GitHub API limits are needed.

No database service is required for this version. The process-local cache is best-effort and is not shared between serverless instances. Add a shared cache/rate-limit store before relying on global consistency at production scale.