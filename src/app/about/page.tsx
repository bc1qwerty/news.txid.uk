import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "About TXID News — independent Bitcoin, macro, and politics analysis.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | TXID News",
    description:
      "About TXID News — independent Bitcoin, macro, and politics analysis.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        About
      </h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p>
          <strong>TXID News</strong> is an independent blog focused on Bitcoin,
          macro economics, and the political landscape surrounding sound money.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li>
            <strong>Bitcoin</strong> — Network fundamentals, market analysis,
            adoption trends, and ecosystem developments. No altcoins.
          </li>
          <li>
            <strong>Macro Economics</strong> — Central bank policy, inflation,
            interest rates, and global monetary dynamics as they relate to
            Bitcoin.
          </li>
          <li>
            <strong>Politics</strong> — Regulatory developments, government
            policy, and the intersection of Bitcoin with political systems.
          </li>
          <li>
            <strong>Opinion</strong> — Editorial perspectives and long-form
            analysis on the topics above.
          </li>
        </ul>

        <h2>Perspective</h2>
        <p>
          This is a personal blog. All analysis represents the author&apos;s
          independent perspective and is not affiliated with any news
          organization, financial institution, or advocacy group.
        </p>

        <h2>Disclaimer</h2>
        <p>
          The content on this site is for informational and educational purposes
          only. Nothing here constitutes financial advice. Always do your own
          research before making any investment decisions.
        </p>

        <h2>Part of txid.uk</h2>
        <p>
          TXID News is part of the{" "}
          <a href="https://txid.uk">txid.uk</a> ecosystem — a collection of
          Bitcoin education and analysis tools.
        </p>
      </div>
    </div>
  );
}
