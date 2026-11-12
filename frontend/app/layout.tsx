import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Space_Grotesk } from "next/font/google";
import { getPortfolio } from "@/lib/sanity/fetch";
import { buildSiteConfig } from "@/lib/portfolio";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  preload: false,
});

// Same fetch as page.tsx via React cache() — one GROQ call, deduped.
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = buildSiteConfig((await getPortfolio()).profile);
  return {
    title: siteConfig.metaTitle,
    description: siteConfig.metaDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // suppressHydrationWarning: a browser extension (QB, data-qb-installed)
      // injects attributes onto <html> after SSR; React otherwise warns on the
      // attribute mismatch. Text/content under <html> is still checked.
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansJp.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
