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

type FilterTag = "drafts" | "published" | Category;

export default function AdminPage() {
  const { user, loading, refresh } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Set<FilterTag>>(new Set());
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const toggleFilter = (tag: FilterTag) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };
  const clearFilters = () => setFilters(new Set());

  const togglePublish = async (slug: string, currentlyDraft: boolean) => {
    if (busySlug) return;
    const action = currentlyDraft ? "publish" : "unpublish";
    if (!currentlyDraft && !confirm("Revert to draft?")) return;
    setBusySlug(slug);
    try {
      const res = await fetch(`${API_URL}/news/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, draft: !currentlyDraft } : p))
        );
      } else {
        alert(data.error || `Failed to ${action}`);
      }
    } catch {
      alert("Network error");
    } finally {
      setBusySlug(null);
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-neutral-400">
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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-400">Admin access required.</p>
      </div>
    );
  }

  /* ── Stats ── */
  const total = posts.length;
  const drafts = posts.filter((p) => p.draft);
  const published = posts.filter((p) => !p.draft);
  const catCounts: Record<string, number> = {};
  for (const key of Object.keys(CATEGORIES)) {
    catCounts[key] = posts.filter((p) => p.category === key).length;
  }

  /* ── Filtered list (multi-select: AND between status + category) ── */
  const filtered = posts.filter((p) => {
    if (filters.size === 0) return true;
    const statusTags = new Set([...filters].filter((f) => f === "drafts" || f === "published"));
    const catTags = new Set([...filters].filter((f) => f !== "drafts" && f !== "published"));
    const passStatus = statusTags.size === 0
      || (statusTags.has("drafts") && p.draft)
      || (statusTags.has("published") && !p.draft);
    const passCat = catTags.size === 0 || catTags.has(p.category);
    return passStatus && passCat;
  });

  /* ── Filter label ── */
  const filterLabel = filters.size === 0
    ? "All Posts"
    : [...filters].map((f) => f === "drafts" ? "Drafts" : f === "published" ? "Published" : CATEGORIES[f as Category]?.name || f).join(" + ");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <Link
          href="/admin/editor"
          className="px-4 py-2 rounded-lg bg-bitcoin text-white text-sm font-medium hover:bg-bitcoin-dark transition"
        >
          + New Post
        </Link>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loadingPosts ? (
        <p className="text-neutral-400 text-center py-12">Loading...</p>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
            <StatCard
              label="Total"
              count={total}
              active={filters.size === 0}
              onClick={clearFilters}
            />
            <StatCard
              label="Published"
              count={published.length}
              color="#22c55e"
              active={filters.has("published")}
              onClick={() => toggleFilter("published")}
            />
            <StatCard
              label="Drafts"
              count={drafts.length}
              color="#f59e0b"
              active={filters.has("drafts")}
              onClick={() => toggleFilter("drafts")}
            />
            {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(
              ([key, val]) => (
                <StatCard
                  key={key}
                  label={val.name}
                  count={catCounts[key] || 0}
                  color={val.color}
                  active={filters.has(key)}
                  onClick={() => toggleFilter(key)}
                />
              )
            )}
          </div>

          {/* ── Filter label ── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-muted">
              {filterLabel} ({filtered.length})
            </h2>
            {filters.size > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-neutral-400 hover:text-bitcoin transition"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* ── Post Table ── */}
          {filtered.length === 0 ? (
            <div className="text-neutral-400 py-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-sm">
              No posts
            </div>
          ) : (
            <div className="border border-neutral-200 dark:border-border rounded-xl overflow-hidden">
              {/* Table header — desktop */}
              <div className="hidden md:grid grid-cols-[1fr_100px_100px_90px_160px] gap-4 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-500 dark:text-muted border-b border-neutral-200 dark:border-border">
                <span>Title</span>
                <span>Category</span>
                <span>Date</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              <ul className="divide-y divide-neutral-200 dark:divide-border">
                {filtered.map((p) => (
                  <PostRow key={p.slug} post={p} busySlug={busySlug} onToggle={togglePublish} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Stats Card ── */
function StatCard({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border text-left transition ${
        active
          ? "border-bitcoin bg-bitcoin/5"
          : "border-neutral-200 dark:border-border bg-white dark:bg-surface hover:border-neutral-300 dark:hover:border-neutral-600"
      }`}
    >
      <div
        className="text-2xl font-bold"
        style={{ color: active ? (color || "#F7931A") : undefined }}
      >
        {count}
      </div>
      <div className="text-xs text-neutral-500 dark:text-muted mt-0.5">
        {label}
      </div>
      {color && (
        <div
          className="w-full h-0.5 rounded mt-2"
          style={{ background: color, opacity: active ? 1 : 0.3 }}
        />
      )}
    </button>
  );
}

/* ── Post Row ── */
function PostRow({ post, busySlug, onToggle }: { post: PostItem; busySlug: string | null; onToggle: (slug: string, draft: boolean) => void }) {
  const cat = CATEGORIES[post.category];
  const busy = busySlug === post.slug;
  return (
    <li className="hover:bg-neutral-50 dark:hover:bg-surface-hover transition-colors">
      {/* Mobile layout */}
      <div className="md:hidden p-4">
        <div className="flex items-center gap-2 mb-1.5">
          {post.draft ? (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
              DRAFT
            </span>
          ) : (
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
              Live
            </span>
          )}
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ color: cat?.color, background: `${cat?.color}18` }}
          >
            {cat?.name}
          </span>
          <span className="text-xs text-neutral-400 ml-auto">{post.date}</span>
        </div>
        <a
          href={post.draft ? `/draft/${post.slug}` : `/post/${post.slug}`}
          target="_blank"
          rel="noopener"
          className="font-medium text-neutral-900 dark:text-white hover:text-bitcoin transition text-sm"
        >
          {post.title}
        </a>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onToggle(post.slug, post.draft)}
            disabled={!!busySlug}
            className={`text-xs px-3 py-1 rounded font-medium transition disabled:opacity-50 ${
              post.draft
                ? "bg-bitcoin text-white hover:bg-bitcoin-dark"
                : "border border-amber-400 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            }`}
          >
            {busy ? "..." : post.draft ? "Publish" : "Unpublish"}
          </button>
          <Link href={`/admin/editor?slug=${post.slug}`} className="text-xs text-neutral-400 hover:text-bitcoin transition">Edit</Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[1fr_100px_100px_90px_160px] gap-4 px-4 py-3 items-center">
        <div className="min-w-0">
          <a
            href={post.draft ? `/draft/${post.slug}` : `/post/${post.slug}`}
            target="_blank"
            rel="noopener"
            className="font-medium text-neutral-900 dark:text-white hover:text-bitcoin transition text-sm truncate block"
          >
            {post.title}
          </a>
          {post.summary && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate">{post.summary}</p>
          )}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded font-medium w-fit"
          style={{ color: cat?.color, background: `${cat?.color}18` }}
        >
          {cat?.name}
        </span>
        <span className="text-xs text-neutral-400 font-mono">{post.date}</span>
        <span>
          {post.draft ? (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
              Draft
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
              Live
            </span>
          )}
        </span>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onToggle(post.slug, post.draft)}
            disabled={!!busySlug}
            className={`text-xs px-2.5 py-1 rounded font-medium transition disabled:opacity-50 ${
              post.draft
                ? "bg-bitcoin text-white hover:bg-bitcoin-dark"
                : "border border-amber-400 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            }`}
          >
            {busy ? "..." : post.draft ? "Publish" : "Unpublish"}
          </button>
          <Link
            href={`/admin/editor?slug=${post.slug}`}
            className="text-xs text-neutral-400 hover:text-bitcoin transition"
          >
            Edit
          </Link>
        </div>
      </div>
    </li>
  );
}
