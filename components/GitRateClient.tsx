"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, GitFork, Github, Globe2, Layers3, LoaderCircle, Share2, Sparkles, Star, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProfileScore } from "@gitrate/scoring-engine";

interface Repository {
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  updatedAt: string;
  isFork: boolean;
}

interface Profile {
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
}

export interface Report {
  profile: Profile;
  score: ProfileScore;
  repositories: Repository[];
}

interface Comparison {
  first: Report;
  second: Report;
}

const apiUrl = "/api";

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`);
  const body = await response.json() as { success: boolean; data?: T; error?: { message: string } };
  if (!response.ok || !body.success || !body.data) throw new Error(body.error?.message ?? "Unable to load GitHub data.");
  return body.data;
}

function normalizeInput(value: string): string {
  const text = value.trim();
  return text.match(/github\.com\/([^/?#]+)/i)?.[1] ?? text.replace(/^@/, "");
}

function SearchForm({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    router.push(`/github/${encodeURIComponent(normalizeInput(value))}`);
  };
  return <form className="search-form" onSubmit={submit}>
    <label className="search-input-wrap"><Github size={19} aria-hidden="true" /><input aria-label="GitHub username or profile URL" placeholder="GitHub username or profile URL" value={value} onChange={(event) => setValue(event.target.value)} /></label>
    <button className="button button-dark" type="submit">Analyze profile<ArrowRight size={17} /></button>
  </form>;
}

function Header() {
  return <header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><Github size={20} /></span>gitrate<span className="brand-period">.</span></Link><nav aria-label="Main navigation"><a href="/#method">Methodology</a><Link href="/compare">Compare</Link><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={19} /></a></nav></header>;
}

function Home() {
  return <><Header /><main>
    <section className="hero page-width"><div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> THE SIGNAL IN YOUR GITHUB</div><h1>Your work,<br /><span>in perspective.</span></h1><p className="hero-subtitle">A thoughtful read on your public GitHub footprint. See what you have built, how you show up, and where to grow next.</p><SearchForm /><div className="hero-note"><span>Free, public profile analysis</span><span className="note-divider" /><span>No sign-in needed</span></div></div><div className="hero-art" aria-label="Illustration of six GitHub profile dimensions"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><span className="core-label">YOUR SIGNAL</span><span className="core-score">06</span><span className="core-grade">SCORING <b>DIMENSIONS</b></span></div><div className="orbit-tag tag-project"><Layers3 size={15} /> Projects <b>150</b></div><div className="orbit-tag tag-activity"><Sparkles size={15} /> Activity <b>350</b></div><div className="orbit-tag tag-community"><UsersRound size={15} /> Community <b>300</b></div><span className="art-caption">A fuller picture, not a popularity contest.</span></div></section>
    <section className="trust-strip"><div className="page-width trust-inner"><span>PUBLIC DATA. CLEAR SIGNALS.</span><span>Transparent scoring</span><span>Built for context</span><span>Never a skill rating</span></div></section>
    <section className="method page-width" id="method"><div className="section-heading"><div><span className="eyebrow">A BETTER READ ON YOUR PROFILE</span><h2>More than a number.</h2></div><p>GitHub is a record of work in motion. GitRate organizes the public signals so you can see what stands out, with the inputs always in view.</p></div><div className="dimension-grid"><article><span className="dimension-icon green"><Layers3 /></span><h3>Projects</h3><p>Original work, repository context, and public engagement.</p><b>150 <small>points</small></b></article><article><span className="dimension-icon blue"><Sparkles /></span><h3>Activity & consistency</h3><p>Recent repository updates, with contribution data limitations called out.</p><b>350 <small>points</small></b></article><article><span className="dimension-icon coral"><UsersRound /></span><h3>Community impact</h3><p>Stars and forks received by your original repositories.</p><b>300 <small>points</small></b></article><article><span className="dimension-icon gold"><Globe2 /></span><h3>Social influence</h3><p>Follower reach, scaled gently so outliers do not dominate.</p><b>100 <small>points</small></b></article><article><span className="dimension-icon lilac"><BookOpen /></span><h3>Languages</h3><p>Programming languages across public repositories.</p><b>50 <small>points</small></b></article><article><span className="dimension-icon ink"><BadgeCheck /></span><h3>Account longevity</h3><p>Time on GitHub, balanced against recent activity.</p><b>50 <small>points</small></b></article></div></section>
    <section className="steps-band"><div className="page-width"><span className="eyebrow">FROM PROFILE TO PERSPECTIVE</span><div className="steps-grid"><div><span>01</span><h3>Enter a username</h3><p>Paste a GitHub handle or profile URL.</p></div><div><span>02</span><h3>Read public signals</h3><p>We fetch public profile and repository data.</p></div><div><span>03</span><h3>Explore the detail</h3><p>See your score, repositories, and score evidence.</p></div></div></div></section>
    <section className="closing-cta page-width"><div><span className="eyebrow">YOUR PROFILE HAS A STORY</span><h2>See yours clearly.</h2><p>Free to explore. Transparent by design.</p></div><SearchForm /></section>
  </main><Footer /></>;
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  return <div className="score-ring" style={{ "--score-progress": `${score / 10}%` } as CSSProperties} aria-label={`GitHub profile score ${score} out of 1000, grade ${grade}`}><div><small>PROFILE SCORE</small><strong>{score}<span>/1000</span></strong><em>{grade}</em></div></div>;
}

function ProfilePage({ username, initialReport }: { username: string; initialReport?: Report }) {
  const [copied, setCopied] = useState<"profile" | "badge" | null>(null);
  const query = useQuery({ queryKey: ["analysis", username], queryFn: () => apiGet<Report>(`/analysis/${encodeURIComponent(username)}`), initialData: initialReport });
  if (query.isPending) return <><Header /><main className="page-width report-shell"><div className="loading-state"><LoaderCircle className="spin" /><p>Reading public GitHub signals for <b>{username}</b>...</p><div className="skeleton-line" /></div></main></>;
  if (query.isError) return <><Header /><main className="page-width report-shell"><div className="error-state"><span className="eyebrow">PROFILE UNAVAILABLE</span><h1>We couldn't load that profile.</h1><p>{query.error.message}</p><SearchForm initial={username} /></div></main></>;
  const { profile, score, repositories } = query.data;
  const originals = repositories.filter((repo) => !repo.isFork);
  const stars = originals.reduce((total, repo) => total + repo.stars, 0);
  const forks = originals.reduce((total, repo) => total + repo.forks, 0);
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied("profile");
  };
  const badgeMarkdown = `[![GitRate Score](https://gitrate.dev${apiUrl}/badge/${encodeURIComponent(profile.username)})](https://gitrate.dev/github/${encodeURIComponent(profile.username)})`;
  const copyBadge = async () => {
    await navigator.clipboard.writeText(badgeMarkdown);
    setCopied("badge");
  };
  return <><Header /><main className="page-width report-shell">
    <div className="breadcrumb"><Link href="/">GitRate</Link><span>/</span><span>{profile.username}</span></div>
    <section className="profile-head"><img src={profile.avatarUrl} alt={`${profile.username}'s GitHub avatar`} /><div className="profile-identity"><span className="eyebrow">PUBLIC PROFILE ANALYSIS</span><h1>{profile.name ?? profile.username}</h1><p>@{profile.username}{profile.location ? ` · ${profile.location}` : ""}</p>{profile.bio && <div className="profile-bio">{profile.bio}</div>}<div className="profile-links"><a className="button button-outline" href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={16} /> View GitHub</a><button className="button button-outline" onClick={copyLink}><Share2 size={16} /> {copied === "profile" ? "Link copied" : "Copy profile link"}</button></div></div><div className="joined"><span>ON GITHUB SINCE</span><b>{new Date(profile.createdAt).getFullYear()}</b></div></section>
    <section className="report-overview"><div className="score-panel"><div className="score-label"><span className="eyebrow">GITRATE SCORE <span className="version">v{score.version}</span></span><span className="score-disclaimer">Public activity, not programming ability.</span></div><div className="score-main"><ScoreRing score={score.total} grade={score.grade} /><div className="score-summary"><span className="grade-pill">GRADE {score.grade}</span><h2>{score.level}</h2><p>A transparent summary of observable profile signals. Every category and its inputs are shown below.</p><a href="#breakdown" className="text-link">Explore your breakdown <ArrowDownRight size={16} /></a></div></div></div><div className="quick-stats"><div><span><Layers3 size={16} /> PUBLIC REPOSITORIES</span><b>{profile.publicRepos}</b></div><div><span><Star size={16} /> STARS RECEIVED</span><b>{stars.toLocaleString()}</b></div><div><span><GitFork size={16} /> FORKS RECEIVED</span><b>{forks.toLocaleString()}</b></div><div><span><UsersRound size={16} /> FOLLOWERS</span><b>{profile.followers.toLocaleString()}</b></div></div></section>
    <section className="content-section" id="breakdown"><div className="section-heading compact"><div><span className="eyebrow">SHOW YOUR WORK</span><h2>Score breakdown</h2></div><p>Six public dimensions add up to 1,000 points. Select a category to understand its inputs.</p></div><div className="score-grid">{score.categories.map((category, index) => <article className="score-category" key={category.id}><div className="category-top"><span className={`category-index index-${index}`}>0{index + 1}</span><span className="category-score">{category.score}<small> / {category.max}</small></span></div><h3>{category.label}</h3><p>{category.explanation}</p><div className="progress-track"><span style={{ width: `${(category.score / category.max) * 100}%` }} /></div><details><summary>Metrics used</summary><ul>{category.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul></details></article>)}</div></section>
    <section className="content-section repositories-section"><div className="section-heading compact"><div><span className="eyebrow">WHAT YOU HAVE MADE</span><h2>Recently updated repositories</h2></div><span className="muted-label">Original public repositories</span></div>{originals.length ? <div className="repo-list">{originals.slice(0, 8).map((repo) => <a className="repo-row" href={repo.htmlUrl} key={repo.name} target="_blank" rel="noreferrer"><div className="repo-main"><h3>{repo.name} <ArrowUpRight size={14} /></h3><p>{repo.description ?? "No description provided."}</p><span className="repo-language">{repo.language ?? "Language not specified"}</span></div><div className="repo-numbers"><span><Star size={15} /> {repo.stars}</span><span><GitFork size={15} /> {repo.forks}</span><time>{new Date(repo.updatedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</time></div></a>)}</div> : <div className="empty-state">No original public repositories found for this profile.</div>}</section>
    <section className="transparency-note"><span className="note-icon"><BadgeCheck size={19} /></span><div><h3>Useful context, never a skill rating.</h3><p>GitRate reflects public activity, profile completeness, open-source presence, and community signals. Contribution totals, pull requests, and reviews are not available from the public endpoints used here, so they are not guessed. The repository list is limited to the 100 most recently updated public repositories.</p></div></section>
    <section className="badge-section"><div><span className="eyebrow">TAKE YOUR SCORE WITH YOU</span><h2>Add your GitRate score to your README</h2><p>The badge updates from the latest cached public analysis.</p></div><div className="badge-preview"><img src={`${apiUrl}/badge/${encodeURIComponent(profile.username)}`} alt={`GitRate score badge for ${profile.username}`} /><code>{badgeMarkdown}</code><button className="button button-outline" onClick={copyBadge}>{copied === "badge" ? "Markdown copied" : "Copy badge Markdown"}</button></div></section>
    <section className="profile-compare"><div><span className="eyebrow">COMPARE WITH CONTEXT</span><h2>Curious how your public signals differ?</h2><p>Compare profile activity, not people.</p></div><Link className="button button-dark" href={`/compare?first=${encodeURIComponent(profile.username)}`}>Compare profiles <ArrowRight size={16} /></Link></section>
  </main><Footer /></>;
}

function ComparePage({ pair, initialFirst = "" }: { pair?: string; initialFirst?: string }) {
  const [first, setFirst] = useState(initialFirst);
  const [second, setSecond] = useState("");
  const router = useRouter();
  const [firstName = "", secondName = ""] = (pair ?? "").split("-vs-");
  const comparison = useQuery({
    queryKey: ["comparison", firstName, secondName],
    queryFn: () => apiGet<Comparison>(`/compare/${encodeURIComponent(firstName)}/${encodeURIComponent(secondName)}`),
    enabled: Boolean(pair && firstName && secondName),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!first.trim() || !second.trim()) return;
    router.push(`/compare/${encodeURIComponent(normalizeInput(first))}-vs-${encodeURIComponent(normalizeInput(second))}`);
  };
  return <><Header /><main className="page-width compare-page"><span className="eyebrow">SIDE BY SIDE, WITH CONTEXT</span><h1>Compare public profiles.</h1><p>Explore how public GitHub activity differs. A score does not say who is the better developer.</p><form className="compare-form" onSubmit={submit}><label><span>PROFILE ONE</span><input aria-label="First GitHub username" placeholder="username or profile URL" value={first} onChange={(event) => setFirst(event.target.value)} /></label><span className="versus">VS</span><label><span>PROFILE TWO</span><input aria-label="Second GitHub username" placeholder="username or profile URL" value={second} onChange={(event) => setSecond(event.target.value)} /></label><button className="button button-dark" type="submit">Compare <ArrowRight size={17} /></button></form>
    {comparison.isPending && pair && <div className="loading-state compare-loading"><LoaderCircle className="spin" /><p>Comparing public profile data...</p></div>}
    {comparison.isError && <div className="error-inline" role="alert">{comparison.error.message}</div>}
    {comparison.data && <ComparisonReport comparison={comparison.data} />}
  </main><Footer /></>;
}

function ComparisonReport({ comparison }: { comparison: Comparison }) {
  const { first, second } = comparison;
  return <section className="comparison-report"><div className="comparison-score-row">{[first, second].map(({ profile, score }) => <article className="comparison-person" key={profile.username}><img src={profile.avatarUrl} alt="" /><div><Link href={`/github/${profile.username}`}>@{profile.username}</Link><strong>{score.total}<small> / 1000</small></strong><span>{score.grade} · {score.level}</span></div></article>)}</div><h2>Category comparison</h2><div className="comparison-categories">{first.score.categories.map((category, index) => { const other = second.score.categories[index]; return <article key={category.id}><div><b>{category.label}</b><span>{category.score} / {category.max}</span></div><div className="comparison-bars"><span style={{ width: `${category.score / category.max * 100}%` }} /><span style={{ width: `${(other?.score ?? 0) / (other?.max || 1) * 100}%` }} /></div><div className="comparison-values"><span>@{first.profile.username} · {category.score}</span><span>@{second.profile.username} · {other?.score ?? "N/A"}</span></div></article>; })}</div><p className="comparison-caveat">Bars show public profile score points only. They are not measures of programming skill.</p></section>;
}

function Footer() {
  return <footer className="footer"><div className="page-width footer-inner"><Link href="/" className="brand"><span className="brand-mark"><Github size={18} /></span>gitrate<span className="brand-period">.</span></Link><span>Analyze. Compare. Improve your GitHub profile.</span><span className="independence">GitRate is an independent project, not affiliated with, sponsored by, or endorsed by GitHub.</span></div></footer>;
}

export function GitRateClient({ view, username, pair, initialFirst, initialReport }: {
  view: "home" | "profile" | "compare";
  username?: string;
  pair?: string;
  initialFirst?: string;
  initialReport?: Report;
}) {
  if (view === "profile" && username) return <ProfilePage username={username} initialReport={initialReport} />;
  if (view === "compare") return <ComparePage pair={pair} initialFirst={initialFirst} />;
  return <Home />;
}