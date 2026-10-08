import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

const siteUrl = "https://gitrate.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GitRate | Analyze your GitHub profile",
    template: "%s | GitRate",
  },
  description: "Turn public GitHub activity into meaningful developer insights.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GitRate",
    title: "GitRate | Analyze your GitHub profile",
    description: "Analyze. Compare. Improve your GitHub Profile.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><Providers>{children}</Providers></body></html>;
}