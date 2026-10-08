import type { Metadata } from "next";
import { GitRateClient } from "@/components/GitRateClient";

export const metadata: Metadata = {
  title: "Compare GitHub Profiles",
  description: "Compare public GitHub profile activity, repositories, languages, and community signals side by side.",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ first?: string }> }) {
  const { first = "" } = await searchParams;
  return <GitRateClient view="compare" initialFirst={first} />;
}