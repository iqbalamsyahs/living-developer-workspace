import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Living Developer Workspace",
  description: "An interactive 3D/2D developer portfolio built with Next.js.",
};

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
