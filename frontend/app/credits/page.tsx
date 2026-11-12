import type { Metadata } from "next";
import Link from "next/link";
import { CREDITS, formatAttribution } from "@/lib/credits";

export const metadata: Metadata = { title: "Credits" };

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-slate-200">
      <Link href="/" className="text-sm text-emerald-400 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-6 font-display text-3xl text-white">Credits</h1>
      <p className="mt-2 text-slate-400">3D models used in this portfolio.</p>
      <ul className="mt-8 space-y-6">
        {CREDITS.map((c) => (
          <li key={c.sourceUrl} className="rounded-lg border border-white/10 p-4">
            <p>{formatAttribution(c)}</p>
            <p className="mt-2 flex flex-wrap gap-4 text-sm text-emerald-400">
              <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Source
              </a>
              <a href={c.authorUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Author
              </a>
              <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                License
              </a>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
