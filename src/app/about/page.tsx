import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About TXID News — an independent personal blog covering Bitcoin, macro economics, and politics.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | TXID News",
    description:
      "About TXID News — an independent personal blog covering Bitcoin, macro economics, and politics.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        About
      </h1>

      <div className="prose prose-lg max-w-none">
        <p>
          <strong>TXID News</strong> is an independent personal blog offering
          analysis and commentary on Bitcoin, macro economics, and politics.
          It is not a news agency, media outlet, or registered press organization.
        </p>

        <h2>What This Site Covers</h2>
        <ul>
          <li>
            <strong>Bitcoin</strong> — Network fundamentals, market analysis,
            adoption trends, and ecosystem developments.
          </li>
          <li>
            <strong>Macro Economics</strong> — Central bank policy, inflation,
            interest rates, and global monetary dynamics as they relate to
            Bitcoin.
          </li>
          <li>
            <strong>Politics</strong> — Regulatory developments, government
            policy, and the intersection of digital assets with political
            systems.
          </li>
          <li>
            <strong>Opinion</strong> — Editorial perspectives and long-form
            analysis on the topics above.
          </li>
        </ul>

        <h2>Nature of Content</h2>
        <p>
          All articles on this site represent the personal opinions and
          independent analysis of the author, published under the pseudonym
          &ldquo;txid.&rdquo; This site is not affiliated with, endorsed by,
          or connected to any news organization, financial institution,
          government agency, or advocacy group.
        </p>
        <p>
          Articles may reference publicly available data, reports, and news
          from third-party sources. Such references are provided for
          informational context and do not imply endorsement by or affiliation
          with those sources.
        </p>

        <h2>Not Financial Advice</h2>
        <p>
          Nothing on this site constitutes financial, investment, tax, or legal
          advice. The content is provided for informational and educational
          purposes only. Readers should conduct their own research and consult
          qualified professionals before making any financial decisions. The
          author may hold positions in assets discussed on this site.
        </p>

        <h2>Accuracy and Corrections</h2>
        <p>
          Every effort is made to ensure the accuracy of the information
          presented. However, errors may occur. If you identify a factual
          error, please reach out and a correction will be issued promptly.
        </p>

        <h2>Contact</h2>
        <p>
          For corrections, inquiries, or takedown requests, contact the author
          via the{" "}
          <a href="https://community.txid.uk">txid.uk community board</a> or
          Nostr.
        </p>

        <h2>Part of txid.uk</h2>
        <p>
          TXID News is part of the{" "}
          <a href="https://txid.uk">txid.uk</a> ecosystem — a collection of
          Bitcoin education, analysis, and development tools.
        </p>

        <p className="text-sm text-neutral-500 mt-8">
          See also: <Link href="/disclaimer">Disclaimer</Link>
        </p>
      </div>
    </div>
  );
}
