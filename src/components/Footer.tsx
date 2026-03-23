import Link from "next/link";
import { SITE_TITLE, SITE_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-500">
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
