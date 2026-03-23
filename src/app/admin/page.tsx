"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginQR from "@/components/LoginQR";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DraftMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

export default function AdminPage() {
  const { user, loading, refresh } = useAuth();
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);

  useEffect(() => {
    fetch("/admin/drafts.json")
      .then((r) => r.json())
      .then(setDrafts)
      .catch(() => setDrafts([]));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!user?.authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <LoginQR onLogin={refresh} />
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Admin
        </h1>
        <span className="text-xs text-neutral-400 font-mono">
          {user.pubkey?.slice(0, 12)}...
        </span>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Drafts ({drafts.length})
        </h2>
        {drafts.length === 0 ? (
          <p className="text-neutral-400 py-8 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
            No drafts
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/draft/${d.slug}`}
                  className="block p-4 rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-surface hover:border-bitcoin/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                      DRAFT
                    </span>
                    <span className="text-xs text-neutral-400">{d.category}</span>
                    <span className="text-xs text-neutral-400">{d.date}</span>
                  </div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    {d.title}
                  </h3>
                  {d.summary && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                      {d.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
