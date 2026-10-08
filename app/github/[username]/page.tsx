import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GitRateClient } from "@/components/GitRateClient";
import { getProfileReport } from "@/lib/analysis";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const report = await getProfileReport(username);
    const title = `${report.profile.username} GitHub Profile Score & Statistics`;
    const description = `Explore ${report.profile.username}'s GitHub profile score (${report.score.total}/1000), repositories, activity, languages, and public developer insights.`;
    const canonical = `/github/${encodeURIComponent(report.profile.username)}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { type: "profile", title: `${title} | GitRate`, description, url: canonical },
      twitter: { card: "summary", title: `${title} | GitRate`, description },
    };
  } catch {
    return { title: `${username} GitHub Profile Analysis`, robots: { index: false, follow: false } };
  }
}

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  try {
    const report = await getProfileReport(username);
    return <GitRateClient view="profile" username={report.profile.username} initialReport={report} />;
  } catch {
    notFound();
  }
}