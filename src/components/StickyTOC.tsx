"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

export default function StickyTOC({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -75% 0px" }
    );

    headings.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="sticky top-20 self-start" aria-label="Table of contents">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
        On this page
      </h4>
      <ul className="space-y-0.5 border-l border-neutral-200 dark:border-neutral-800">
        {headings.map((h) => (
          <li key={h.slug}>
            <a
              href={`#${h.slug}`}
              className={`block pl-3 py-1 text-[13px] leading-snug transition-colors border-l-2 -ml-px ${
                activeId === h.slug
                  ? "border-bitcoin text-bitcoin font-medium"
                  : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
