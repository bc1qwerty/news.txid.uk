"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginQR from "@/components/LoginQR";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL, CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/constants";

interface PostItem {
  slug: string;
  title: string;
  date: string;
  category: Category;
  summary: string;
  draft: boolean;
}

export default function AdminPage() {
  const { user, loading, refresh } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) return;
    setLoadingPosts(true);
    fetch(`${API_URL}/news/posts`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setError("Failed to load posts");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoadingPosts(false));
  }, [user?.isAdmin]);

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

  const drafts = posts.filter((p) => p.draft);
  const published = posts.filter((p) => !p.draft);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Admin
        </h1>
        <Link
          href="/admin/editor"
          className="px-4 py-2 rounded-lg bg-bitcoin text-white text-sm font-medium hover:bg-bitcoin-dark transition"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {loadingPosts ? (
        <p className="text-neutral-400 text-center py-12">Loading posts...</p>
      ) : (
        <>
          {/* Drafts */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Drafts ({drafts.length})
            </h2>
            {drafts.length === 0 ? (
              <p className="text-neutral-400 py-6 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-sm">
                No drafts
              </p>
            ) : (
              <ul className="space-y-3">
                {drafts.map((p) => (
                  <PostRow key={p.slug} post={p} />
                ))}
              </ul>
            )}
          </section>

          {/* Published */}
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Published ({published.length})
            </h2>
            {published.length === 0 ? (
              <p className="text-neutral-400 py-6 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-sm">
                No published posts
              </p>
            ) : (
              <ul className="space-y-3">
                {published.map((p) => (
                  <PostRow key={p.slug} post={p} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function PostRow({ post }: { post: PostItem }) {
  const cat = CATEGORIES[post.category];
  return (
    <li>
      <Link
        href={`/admin/editor?slug=${post.slug}`}
        className="block p-4 rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-surface hover:border-bitcoin/50 transition-colors"
      >
        <div className="flex items-center gap-3 mb-1">
          {post.draft && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
              DRAFT
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={{
              color: cat?.color || "#999",
              background: `${cat?.color || "#999"}18`,
            }}
          >
            {cat?.name || post.category}
          </span>
          <span className="text-xs text-neutral-400">{post.date}</span>
        </div>
        <h3 className="font-medium text-neutral-900 dark:text-white">
          {post.title}
        </h3>
        {post.summary && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
            {post.summary}
          </p>
        )}
      </Link>
    </li>
  );
}
