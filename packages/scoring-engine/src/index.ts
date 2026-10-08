export const SCORING_VERSION = "1.0.0";

export interface RepositoryMetric {
  stars: number;
  forks: number;
  hasReadme: boolean | null;
  hasDescription: boolean;
  pushedAt: string | null;
  isFork: boolean;
  language: string | null;
}

export interface ProfileMetrics {
  followers: number;
  publicGists: number;
  createdAt: string;
  repositories: RepositoryMetric[];
  languages: string[];
}

export interface ScoreCategory {
  id: "projects" | "activity" | "community" | "social" | "languages" | "longevity";
  label: string;
  score: number;
  max: number;
  explanation: string;
  metrics: string[];
}

export interface ProfileScore {
  total: number;
  grade: string;
  level: string;
  version: string;
  categories: ScoreCategory[];
}

export const normalize = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value) || max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

export const normalizeLog = (value: number, ceiling: number): number => {
  if (!Number.isFinite(value) || value <= 0 || ceiling <= 0) return 0;
  return Math.min(1, Math.log1p(value) / Math.log1p(ceiling));
};

export const gradeFor = (score: number): string => {
  if (score >= 900) return "A+";
  if (score >= 850) return "A";
  if (score >= 800) return "A-";
  if (score >= 750) return "B+";
  if (score >= 700) return "B";
  if (score >= 650) return "B-";
  if (score >= 600) return "C+";
  if (score >= 500) return "C";
  if (score >= 400) return "C-";
  if (score >= 300) return "D";
  return "E";
};

export const levelFor = (score: number): string => {
  if (score >= 950) return "Outstanding Open Source Presence";
  if (score >= 850) return "Exceptional GitHub Presence";
  if (score >= 750) return "Highly Active Developer";
  if (score >= 650) return "Established Developer";
  if (score >= 500) return "Active Developer";
  if (score >= 300) return "Emerging Developer";
  return "Getting Started";
};

const points = (fraction: number, max: number): number => Math.round(fraction * max);

export const calculateScore = (profile: ProfileMetrics, now = new Date()): ProfileScore => {
  const original = profile.repositories.filter((repository) => !repository.isFork);
  const totalStars = original.reduce((sum, repository) => sum + repository.stars, 0);
  const totalForks = original.reduce((sum, repository) => sum + repository.forks, 0);
  const meaningfulLanguages = new Set(
    profile.languages.filter((language) => !["HTML", "CSS", "Markdown"].includes(language)),
  );
  const activeRepositories = original.filter((repository) => {
    if (!repository.pushedAt) return false;
    return now.getTime() - new Date(repository.pushedAt).getTime() < 365 * 24 * 60 * 60 * 1000;
  }).length;
  const ageYears = Math.max(0, (now.getTime() - new Date(profile.createdAt).getTime()) / 31_557_600_000);
  const documented = original.filter((repository) => repository.hasReadme !== null);
  const quality = documented.length
    ? documented.filter((repository) => repository.hasReadme && repository.hasDescription).length / documented.length
    : 0;
  const projectSignal = documented.length
    ? normalizeLog(original.length, 40) * 0.45 + quality * 0.3 + normalizeLog(totalStars, 500) * 0.25
    : normalizeLog(original.length, 40) * 0.64 + normalizeLog(totalStars, 500) * 0.36;
  const categories: ScoreCategory[] = [
    {
      id: "projects",
      label: "Projects",
      score: points(projectSignal, 150),
      max: 150,
      explanation: "Original repositories, documentation quality, and earned stars.",
      metrics: [`${original.length} original repositories`, `${totalStars} stars`, documented.length ? `${Math.round(quality * 100)}% of checked repositories have a description and README` : "README coverage: not checked by the current API"],
    },
    {
      id: "activity",
      label: "Activity & Consistency",
      score: points(normalize(activeRepositories, 0, Math.min(12, Math.max(1, original.length))) * 0.65 + normalizeLog(activeRepositories, 12) * 0.35, 350),
      max: 350,
      explanation: "Recent repository updates are visible; contribution totals are not exposed by this API route.",
      metrics: [`${activeRepositories} original repositories updated in the last year`, "Contribution graph: unavailable through the public REST API"],
    },
    {
      id: "community",
      label: "Community Impact",
      score: points(normalizeLog(totalStars, 1_000) * 0.65 + normalizeLog(totalForks, 300) * 0.35, 300),
      max: 300,
      explanation: "Public stars and forks received by original repositories, normalized to limit outliers.",
      metrics: [`${totalStars} stars received`, `${totalForks} forks received`, `${profile.publicGists} public gists`],
    },
    {
      id: "social",
      label: "Social Influence",
      score: points(normalizeLog(profile.followers, 10_000), 100),
      max: 100,
      explanation: "Follower count uses logarithmic scaling. Following count is never rewarded.",
      metrics: [`${profile.followers} followers`],
    },
    {
      id: "languages",
      label: "Languages",
      score: points(normalize(meaningfulLanguages.size, 0, 6), 50),
      max: 50,
      explanation: "Distinct repository languages; HTML, CSS, and Markdown are excluded.",
      metrics: [`${meaningfulLanguages.size} meaningful languages`],
    },
    {
      id: "longevity",
      label: "Account Longevity",
      score: points(normalize(ageYears, 0, 8) * (activeRepositories > 0 ? 1 : 0.5), 50),
      max: 50,
      explanation: "Account age contributes modestly and is reduced when there is no recent repository activity.",
      metrics: [`${ageYears.toFixed(1)} years on GitHub`, `${activeRepositories} recently updated repositories`],
    },
  ];
  const total = categories.reduce((sum, category) => sum + category.score, 0);
  return { total, grade: gradeFor(total), level: levelFor(total), version: SCORING_VERSION, categories };
};