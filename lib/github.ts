import { Octokit } from "@octokit/rest";
import type { ProfileMetrics, RepositoryMetric } from "@gitrate/scoring-engine";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
  userAgent: "GitRate/0.2.0",
  request: { timeout: 8_000 },
});

export interface AnalyzedProfile {
  profile: {
    username: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    website: string | null;
    followers: number;
    following: number;
    publicRepos: number;
    publicGists: number;
    createdAt: string;
    githubUrl: string;
  };
  metrics: ProfileMetrics;
  repositories: Array<RepositoryMetric & {
    name: string;
    description: string | null;
    htmlUrl: string;
    watchers: number;
    openIssues: number;
    updatedAt: string;
  }>;
}

const cache = new Map<string, { expiresAt: number; data: AnalyzedProfile }>();

export const normalizeUsername = (input: string): string => {
  const value = input.trim();
  const match = value.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)\/?(?:[?#].*)?$/i);
  const username = match?.[1] ?? value;
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    throw Object.assign(new Error("Enter a valid GitHub username or profile URL."), { status: 400, code: "INVALID_USERNAME" });
  }
  return username;
};

export const getAnalyzedProfile = async (usernameInput: string): Promise<AnalyzedProfile> => {
  const username = normalizeUsername(usernameInput);
  const cached = cache.get(username.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  try {
    const [{ data: user }, { data: repos }] = await Promise.all([
      octokit.users.getByUsername({ username }),
      octokit.repos.listForUser({ username, per_page: 100, sort: "updated", direction: "desc" }),
    ]);
    const repositories = repos.map((repo) => ({
      name: repo.name,
      description: repo.description ?? null,
      htmlUrl: repo.html_url,
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      watchers: repo.watchers_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      updatedAt: repo.updated_at ?? repo.pushed_at ?? new Date(0).toISOString(),
      pushedAt: repo.pushed_at ?? null,
      isFork: repo.fork,
      hasReadme: null,
      hasDescription: Boolean(repo.description?.trim()),
    }));
    const profile: AnalyzedProfile["profile"] = {
      username: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      website: user.blog || null,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      createdAt: user.created_at,
      githubUrl: user.html_url,
    };
    const metrics: ProfileMetrics = {
      followers: user.followers,
      publicGists: user.public_gists,
      createdAt: user.created_at,
      repositories,
      languages: [...new Set(repositories.flatMap((repo) => repo.language ? [repo.language] : []))],
    };
    const data = { profile, metrics, repositories };
    if (cache.size >= 500) {
      for (const [key, entry] of cache) if (entry.expiresAt <= Date.now()) cache.delete(key);
      if (cache.size >= 500) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
    }
    cache.set(username.toLowerCase(), { data, expiresAt: Date.now() + 30 * 60_000 });
    return data;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404) throw Object.assign(new Error("GitHub user not found."), { status: 404, code: "GITHUB_USER_NOT_FOUND" });
    if (status === 403 || status === 429) throw Object.assign(new Error("GitHub API rate limit reached. Please try again later."), { status: 503, code: "GITHUB_RATE_LIMIT" });
    if (status) throw Object.assign(new Error("GitHub could not complete this request."), { status: 502, code: "GITHUB_API_ERROR" });
    throw error;
  }
};