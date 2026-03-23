"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoginQR from "@/components/LoginQR";
import Link from "next/link";
import { API_URL, CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

function EditorContent() {
  const { user, loading, refresh } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editSlug = searchParams.get("slug");

  /* ── Post state ── */
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState<Category>("bitcoin");
  const [tagsInput, setTagsInput] = useState("");
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("txid");
  const [content, setContent] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [sha, setSha] = useState<string | null>(null);

  /* ── UI state ── */
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [loadingPost, setLoadingPost] = useState(!!editSlug);
  const [deleting, setDeleting] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);

  /* ── Load existing post ── */
  useEffect(() => {
    if (!editSlug || !user?.isAdmin) return;
    setLoadingPost(true);
    fetch(`${API_URL}/news/posts/${editSlug}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setTitle(d.title || "");
        setSlug(editSlug);
        setDate(d.date || "");
        setCategory(d.category || "opinion");
        setTagsInput((d.tags || []).join(", "));
        setSummary(d.summary || "");
        setAuthor(d.author || "txid");
        setContent(d.content || "");
        setIsDraft(d.draft !== false);
        setSha(d.sha);
      })
      .catch(() => setMsg({ text: "Failed to load post", ok: false }))
      .finally(() => setLoadingPost(false));
  }, [editSlug, user?.isAdmin]);

  /* ── Auto-generate slug from title ── */
  useEffect(() => {
    if (editSlug) return; // don't overwrite when editing
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    if (titleSlug) setSlug(`${date}-${titleSlug}`);
  }, [title, date, editSlug]);

  /* ── Save ── */
  const save = useCallback(
    async (asDraft: boolean) => {
      if (!title.trim()) return setMsg({ text: "Title is required", ok: false });
      if (!content.trim()) return setMsg({ text: "Content is required", ok: false });
      if (!slug.trim()) return setMsg({ text: "Slug is required", ok: false });

      setSaving(true);
      setMsg(null);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      try {
        const res = await fetch(`${API_URL}/news/posts/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": user?.csrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            date,
            category,
            tags,
            summary,
            author,
            draft: asDraft,
            content,
            sha,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setSha(data.sha);
          setIsDraft(asDraft);
          setMsg({ text: asDraft ? "Saved as draft" : "Published", ok: true });
          if (!editSlug) {
            router.replace(`/admin/editor?slug=${slug}`);
          }
        } else {
          setMsg({ text: data.error || "Save failed", ok: false });
        }
      } catch {
        setMsg({ text: "Network error", ok: false });
      } finally {
        setSaving(false);
      }
    },
    [title, content, slug, tagsInput, date, category, summary, author, sha, user, editSlug, router]
  );

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!editSlug || !confirm("Delete this post permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/news/posts/${editSlug}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": user?.csrfToken || "" },
        credentials: "include",
      });
      if (res.ok) router.push("/admin");
      else {
        const d = await res.json();
        setMsg({ text: d.error || "Delete failed", ok: false });
      }
    } catch {
      setMsg({ text: "Network error", ok: false });
    } finally {
      setDeleting(false);
    }
  };

  /* ── Markdown toolbar insert ── */
  const insert = (before: string, after = "") => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = content.slice(s, e) || "text";
    const replacement = before + sel + after;
    const next = content.slice(0, s) + replacement + content.slice(e);
    setContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    }, 0);
  };

  /* ── Keyboard shortcuts ── */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      setContent(content.slice(0, s) + "  " + content.slice(end));
      setTimeout(() => {
        if (taRef.current) taRef.current.selectionStart = taRef.current.selectionEnd = s + 2;
      }, 0);
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); insert("**", "**"); }
      if (e.key === "i") { e.preventDefault(); insert("*", "*"); }
      if (e.key === "s") { e.preventDefault(); save(isDraft); }
    }
  };

  /* ── Auth guards ── */
  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-neutral-400">Loading...</div>;
  if (!user?.authenticated) return <div className="max-w-md mx-auto px-4 py-12"><LoginQR onLogin={refresh} /></div>;
  if (!user.isAdmin) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-neutral-400">Admin access required.</p></div>;
  if (loadingPost) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-neutral-400">Loading post...</div>;

  /* ── Preview HTML ── */
  const previewHtml = content ? (marked.parse(content) as string) : "<p class='text-neutral-400'>Preview will appear here...</p>";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm transition">
            ← Admin
          </Link>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {editSlug ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {msg && (
            <span className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>
              {msg.text}
            </span>
          )}
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-border text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:border-bitcoin/50 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-bitcoin text-white text-sm font-medium hover:bg-bitcoin-dark transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="ed-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="ed-input"
          />
        </div>
        <div>
          <label className="ed-label">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated"
            className="ed-input font-mono text-xs"
            disabled={!!editSlug}
          />
        </div>
        <div>
          <label className="ed-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ed-input"
          />
        </div>
        <div>
          <label className="ed-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="ed-input"
          >
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="ed-label">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="bitcoin, lightning, payments"
            className="ed-input"
          />
        </div>
        <div>
          <label className="ed-label">Summary</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief description..."
            className="ed-input"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <div className="flex items-center gap-1 border border-neutral-200 dark:border-border rounded-lg p-1">
          <ToolBtn label="B" title="Bold (Ctrl+B)" onClick={() => insert("**", "**")} bold />
          <ToolBtn label="I" title="Italic (Ctrl+I)" onClick={() => insert("*", "*")} italic />
          <ToolBtn label="H2" title="Heading 2" onClick={() => insert("\n## ")} />
          <ToolBtn label="H3" title="Heading 3" onClick={() => insert("\n### ")} />
          <span className="w-px h-5 bg-neutral-300 dark:bg-border mx-1" />
          <ToolBtn label="Link" title="Link" onClick={() => insert("[", "](url)")} />
          <ToolBtn label="Img" title="Image" onClick={() => insert("![alt](", ")")} />
          <ToolBtn label="Code" title="Code block" onClick={() => insert("\n```\n", "\n```\n")} />
          <ToolBtn label="Quote" title="Blockquote" onClick={() => insert("\n> ")} />
          <span className="w-px h-5 bg-neutral-300 dark:bg-border mx-1" />
          <ToolBtn label="UL" title="Bullet list" onClick={() => insert("\n- ")} />
          <ToolBtn label="OL" title="Ordered list" onClick={() => insert("\n1. ")} />
          <ToolBtn label="HR" title="Horizontal rule" onClick={() => insert("\n---\n")} />
          <ToolBtn label="Table" title="Table" onClick={() => insert("\n| Col 1 | Col 2 |\n|---|---|\n| ", " | |\n")} />
        </div>

        {/* Mobile tab toggle */}
        <div className="flex items-center gap-1 ml-auto lg:hidden border border-neutral-200 dark:border-border rounded-lg p-1">
          <button
            onClick={() => setTab("edit")}
            className={`px-3 py-1 text-xs rounded font-medium transition ${
              tab === "edit" ? "bg-bitcoin text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`px-3 py-1 text-xs rounded font-medium transition ${
              tab === "preview" ? "bg-bitcoin text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor + Preview split */}
      <div className="ed-split">
        {/* Editor pane */}
        <div className={`ed-pane ${tab === "preview" ? "hidden lg:block" : ""}`}>
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Write your article in Markdown..."
            className="ed-textarea"
            spellCheck={false}
          />
        </div>

        {/* Preview pane */}
        <div className={`ed-pane ${tab === "edit" ? "hidden lg:block" : ""}`}>
          <div
            className="prose prose-lg max-w-none p-4 min-h-[500px]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      {/* Bottom actions */}
      {editSlug && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-border flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <span>Status: {isDraft ? "Draft" : "Published"}</span>
            {editSlug && (
              <a
                href={isDraft ? `/draft/${editSlug}` : `/post/${editSlug}`}
                target="_blank"
                rel="noopener"
                className="hover:text-bitcoin transition"
              >
                View →
              </a>
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
  label,
  title,
  onClick,
  bold,
  italic,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition ${
        bold ? "font-bold" : ""
      } ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-20 text-center text-neutral-400">Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
