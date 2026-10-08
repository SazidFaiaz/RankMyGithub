import type { Metadata } from "next";
import { GitRateClient } from "@/components/GitRateClient";

type ComparisonPageProps = { params: Promise<{ pair: string }> };

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { pair } = await params;
  const [first = "GitHub profile", second = "comparison"] = pair.split("-vs-");
  const title = `${first} vs ${second} GitHub Comparison`;
  const description = `Compare ${first} and ${second}'s public GitHub profile scores, repositories, activity, and community signals.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${encodeURIComponent(pair)}` },
    openGraph: { title: `${title} | GitRate`, description },
    twitter: { card: "summary", title: `${title} | GitRate`, description },
  };
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { pair } = await params;
  return <GitRateClient view="compare" pair={pair} />;
}