# API

Base path: `/api`

## `GET /health`

Returns service health in the standard success envelope.

## `GET /analysis/:username`

Accepts a GitHub login or a GitHub profile URL. Returns normalized public profile data, the 100 most recently updated public repositories, and a server-computed score with version/category evidence. The process-local cache TTL is 30 minutes. This route is limited to 20 requests per minute per IP.

## `GET /compare/:username1/:username2`

Returns two independently analyzed public profiles and scores; limited to 10 requests per minute per IP. Duplicate usernames return 400.

## `GET /badge/:username`

Returns an SVG generated from the latest cached or fetched public profile analysis.

Errors use stable codes such as `INVALID_USERNAME`, `GITHUB_USER_NOT_FOUND`, and `GITHUB_RATE_LIMIT`. Server errors do not return stack traces.