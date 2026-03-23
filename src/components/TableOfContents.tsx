"use client";

import { useState } from "react";
import type { TocItem } from "@/lib/toc";

export default function TableOfContents({
  headings,
}: {
  headings: TocItem[];
}) {
  const [open, setOpen] = useState(false);

  if (headings.length < 3) return null;

  return (
    <nav className="mb-8 border border-neutral-200 dark:border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-surface hover:bg-neutral-100 dark:hover:bg-surface-hover transition"
        aria-expanded={open}
      >
        <span>Table of Contents</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ol className="px-5 py-3 space-y-1.5 list-decimal list-inside">
          {headings.map((h) => (
            <li key={h.slug}>
              <a
                href={`#${h.slug}`}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-bitcoin transition"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
