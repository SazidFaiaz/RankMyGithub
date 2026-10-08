# Deployment

The root Vercel project builds the Vite app and exposes the Express API through a serverless catch-all function. Connect the repository to Vercel, configure Node.js 22+, and add the environment values from `.env.example` in the Vercel project settings. `GITHUB_TOKEN` and `JWT_SECRET` are server-side secrets; never prefix them with `VITE_`.

The API cache in this release is process-local and does not provide cross-instance persistence. MongoDB Atlas storage, production cache behavior, security review, and deployed smoke tests are not complete yet. Do not consider this scaffold production-ready until those phases are complete and verified.