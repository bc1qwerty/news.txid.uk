import Link from "next/link";
import { SITE_TITLE } from "@/lib/constants";

const ecosystem = [
  { name: "TX Explorer", href: "https://txid.uk" },
  { name: "BTC Education", href: "https://learn.txid.uk" },
  { name: "Community", href: "https://community.txid.uk" },
  { name: "Macro Analysis", href: "https://macro.txid.uk" },
  { name: "Dev Tools", href: "https://tools.txid.uk" },
  { name: "Apps", href: "https://apps.txid.uk" },
  { name: "Mining Simulator", href: "https://sim.txid.uk" },
  { name: "Node Map", href: "https://map.txid.uk" },
  { name: "Portfolio", href: "https://portfolio.txid.uk" },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Ecosystem */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
            txid.uk Ecosystem
          </h3>
          <div className="flex flex-wrap gap-2">
            {ecosystem.map((site) => (
              <a
                key={site.name}
                href={site.href}
                className="text-sm px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-bitcoin hover:border-bitcoin/30 transition"
              >
                {site.name}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800/50 text-sm text-neutral-500 dark:text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {SITE_TITLE}
            </span>
            <Link
              href="/about"
              className="hover:text-neutral-900 dark:hover:text-white transition"
            >
              About
            </Link>
            <a
              href="/feed.xml"
              className="hover:text-neutral-900 dark:hover:text-white transition"
            >
              RSS
            </a>
          </div>
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://txid.uk"
              className="hover:text-bitcoin transition"
            >
              txid.uk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
