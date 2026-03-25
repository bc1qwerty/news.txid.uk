import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Legal disclaimer for TXID News.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: "Disclaimer | TXID News",
    description: "Legal disclaimer for TXID News.",
    url: `${SITE_URL}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
        Disclaimer
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-neutral-500">Last updated: March 25, 2026</p>

        <h2>General</h2>
        <p>
          TXID News (news.txid.uk) is an independent personal blog. It is not a
          registered news agency, media outlet, or licensed financial service
          provider in any jurisdiction. The word &ldquo;News&rdquo; in the site
          name refers to the subject matter covered (current events related to
          Bitcoin and macro economics) and does not indicate registration as a
          news organization under any applicable law.
        </p>

        <h2>Personal Opinion</h2>
        <p>
          All content published on this site — including articles, analysis, and
          commentary — represents the personal opinions of the author, writing
          under the pseudonym &ldquo;txid.&rdquo; Views expressed do not
          represent the positions of any employer, organization, or third party.
        </p>

        <h2>Not Financial Advice</h2>
        <p>
          Nothing on this site constitutes financial, investment, tax, or legal
          advice. All content is provided &ldquo;as is&rdquo; for informational
          and educational purposes only. You should not act upon any information
          on this site without seeking professional advice. The author assumes no
          responsibility for losses or damages arising from the use of
          information provided on this site.
        </p>

        <h2>Conflict of Interest Disclosure</h2>
        <p>
          The author may hold, acquire, or dispose of positions in Bitcoin and
          other assets discussed on this site. Such holdings are not disclosed on
          a per-article basis, but readers should assume a potential conflict of
          interest exists for any asset discussed.
        </p>

        <h2>Accuracy</h2>
        <p>
          While every effort is made to ensure accuracy, the author makes no
          warranties or representations regarding the completeness, accuracy,
          reliability, or suitability of any information on this site.
          Information may become outdated. Data sourced from third parties is
          presented in good faith but is not independently verified unless
          explicitly stated.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          This site may contain links to third-party websites. These links are
          provided for convenience and do not imply endorsement. The author has
          no control over the content or availability of external sites and
          accepts no liability for them.
        </p>

        <h2>Copyright</h2>
        <p>
          All original content on this site is the intellectual property of the
          author. Short excerpts may be quoted with attribution and a link to the
          original article. Reproduction of full articles requires written
          permission.
        </p>

        <h2>No Professional Relationship</h2>
        <p>
          Reading, subscribing to, or interacting with this site does not create
          a client, advisory, fiduciary, or professional relationship of any
          kind between the reader and the author.
        </p>

        <h2>Contact</h2>
        <p>
          For corrections, takedown requests, or legal inquiries, contact the
          author via the{" "}
          <a href="https://community.txid.uk">txid.uk community board</a> or
          Nostr.
        </p>
      </div>
    </div>
  );
}
