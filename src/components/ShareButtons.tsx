"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/constants";

export default function ShareButtons({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const url = `${SITE_URL}/post/${slug}`;
  const [copied, setCopied] = useState(false);

  const shareX = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable — user can copy from address bar
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnClass =
    "text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-border hover:border-neutral-300 dark:hover:border-neutral-600";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-500 dark:text-muted">Share:</span>
      <button onClick={shareX} className={btnClass}>
        X / Twitter
      </button>
      <button onClick={copyLink} className={btnClass}>
        {copied ? (
          <span className="text-cat-opinion">Copied</span>
        ) : (
          "Copy Link"
        )}
      </button>
    </div>
  );
}
