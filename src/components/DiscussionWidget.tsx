"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/constants";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface Author {
  id: number;
  pubkey: string;
  displayName: string | null;
  isAdmin: boolean;
}

interface Comment {
  id: number;
  body: string;
  voteScore: number;
  parentId: number | null;
  createdAt: number;
  author: Author;
  userVote: number | null;
  replies: Comment[];
}

interface Post {
  id: number;
  title: string;
  body: string;
  voteScore: number;
  commentCount: number;
  createdAt: number;
  author: Author;
  userVote?: number | null;
}

interface Discussion {
  post: Post;
  comments: Comment[];
}

interface Props {
  sourceUrl: string;
  sourceSite: string;
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function DiscussionWidget({ sourceUrl, sourceSite }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ postId: number; commentId?: number } | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/discussions?source_url=${encodeURIComponent(sourceUrl)}&source_site=${sourceSite}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setDiscussions(data.discussions || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [sourceUrl, sourceSite]);

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 20000);
    return () => clearInterval(interval);
  }, [fetchDiscussions]);

  /** Post a new top-level comment (= new community post) */
  async function handleNewComment() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/discussions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": (user as AuthUser)?.csrfToken || "",
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          source_site: sourceSite,
          body: body.trim(),
          lang: "en",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post");
        return;
      }

      setBody("");
      await fetchDiscussions();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  /** Reply to a community post (= add comment to that post) */
  async function handleReply() {
    if (!replyTo || !replyBody.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/discussions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": (user as AuthUser)?.csrfToken || "",
        },
        body: JSON.stringify({
          source_url: sourceUrl,
          source_site: sourceSite,
          body: replyBody.trim(),
          parent_post_id: replyTo.postId,
          parent_id: replyTo.commentId || null,
          lang: "en",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reply");
        return;
      }

      setReplyBody("");
      setReplyTo(null);
      await fetchDiscussions();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function totalCount(): number {
    let n = discussions.length;
    for (const d of discussions) {
      n += d.comments.length;
      for (const c of d.comments) n += c.replies?.length || 0;
    }
    return n;
  }

  if (loading) {
    return (
      <div className="sticky top-20 self-start">
        <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
          Discussion
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const count = totalCount();
  const isLoggedIn = user?.authenticated;

  return (
    <div className="sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 scrollbar-thin">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
        Discussion{count > 0 ? ` (${count})` : ""}
      </h4>

      {/* Discussions = community posts rendered as comments */}
      {discussions.length > 0 ? (
        <div className="space-y-4 mb-4">
          {discussions.map((d) => (
            <DiscussionItem
              key={d.post.id}
              discussion={d}
              isLoggedIn={!!isLoggedIn}
              replyTo={replyTo}
              replyBody={replyBody}
              submitting={submitting}
              onReplyTo={setReplyTo}
              onReplyBodyChange={setReplyBody}
              onSubmitReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {/* Error */}
      {error && <div className="text-xs text-red-500 mb-2">{error}</div>}

      {/* New comment form (= creates a new community post) */}
      {isLoggedIn ? (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={5000}
            className="w-full text-sm p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none focus:outline-none focus:border-bitcoin transition"
          />
          <button
            onClick={handleNewComment}
            disabled={submitting || !body.trim()}
            className="mt-1.5 w-full text-sm font-medium py-1.5 rounded-lg bg-bitcoin text-white hover:bg-bitcoin-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Posting..." : "Comment"}
          </button>
        </div>
      ) : authLoading ? null : (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).txidAuth) {
                (window as any).txidAuth.showLoginModal();
              }
            }}
            className="w-full text-sm font-medium py-2 rounded-lg border border-bitcoin text-bitcoin hover:bg-bitcoin/10 transition"
          >
            Login with Lightning to comment
          </button>
        </div>
      )}

      {/* Community link */}
      {discussions.length > 0 && (
        <div className="mt-3 text-center">
          <a
            href={`https://community.txid.uk/post/${discussions[0].post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-bitcoin transition"
          >
            View on Community →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── DiscussionItem: community post rendered as a top-level comment ───

function DiscussionItem({
  discussion,
  isLoggedIn,
  replyTo,
  replyBody,
  submitting,
  onReplyTo,
  onReplyBodyChange,
  onSubmitReply,
}: {
  discussion: Discussion;
  isLoggedIn: boolean;
  replyTo: { postId: number; commentId?: number } | null;
  replyBody: string;
  submitting: boolean;
  onReplyTo: (v: { postId: number; commentId?: number } | null) => void;
  onReplyBodyChange: (v: string) => void;
  onSubmitReply: () => void;
}) {
  const { post, comments } = discussion;
  const authorName = post.author.displayName || post.author.pubkey.slice(0, 8) + "...";
  const isReplyingToThis = replyTo?.postId === post.id && !replyTo?.commentId;

  return (
    <div>
      {/* Post as comment */}
      <div className="group">
        <div className="flex items-start gap-2">
          {/* Avatar initial */}
          <div className="w-6 h-6 rounded-full bg-bitcoin/15 flex items-center justify-center text-bitcoin text-[10px] font-bold shrink-0 mt-0.5">
            {(post.author.displayName || post.author.pubkey)[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {escapeHtml(authorName)}
              </span>
              {post.author.isAdmin && (
                <span className="text-[10px] px-1 py-px rounded bg-bitcoin/10 text-bitcoin font-medium">
                  Admin
                </span>
              )}
              <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                {timeAgo(post.createdAt)}
              </span>
            </div>
            <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
              {post.body}
            </p>

            {/* Reply + Community link */}
            <div className="flex items-center gap-3 mt-1">
              {isLoggedIn && (
                <button
                  onClick={() =>
                    onReplyTo(isReplyingToThis ? null : { postId: post.id })
                  }
                  className="text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-bitcoin transition"
                >
                  Reply
                </button>
              )}
              <a
                href={`https://community.txid.uk/post/${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-bitcoin transition"
              >
                #{post.id}
              </a>
            </div>

            {/* Reply form */}
            {isReplyingToThis && (
              <ReplyForm
                body={replyBody}
                submitting={submitting}
                onChange={onReplyBodyChange}
                onSubmit={onSubmitReply}
                onCancel={() => onReplyTo(null)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Comments on this post = replies */}
      {comments.length > 0 && (
        <div className="ml-8 mt-2 pl-3 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-3">
          {comments.map((c) => (
            <ReplyItem
              key={c.id}
              comment={c}
              postId={post.id}
              isLoggedIn={isLoggedIn}
              replyTo={replyTo}
              replyBody={replyBody}
              submitting={submitting}
              onReplyTo={onReplyTo}
              onReplyBodyChange={onReplyBodyChange}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReplyItem: comment on a community post rendered as a reply ───

function ReplyItem({
  comment,
  postId,
  isLoggedIn,
  replyTo,
  replyBody,
  submitting,
  onReplyTo,
  onReplyBodyChange,
  onSubmitReply,
}: {
  comment: Comment;
  postId: number;
  isLoggedIn: boolean;
  replyTo: { postId: number; commentId?: number } | null;
  replyBody: string;
  submitting: boolean;
  onReplyTo: (v: { postId: number; commentId?: number } | null) => void;
  onReplyBodyChange: (v: string) => void;
  onSubmitReply: () => void;
}) {
  const authorName = comment.author.displayName || comment.author.pubkey.slice(0, 8) + "...";
  const isReplyingToThis = replyTo?.postId === postId && replyTo?.commentId === comment.id;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {escapeHtml(authorName)}
        </span>
        {comment.author.isAdmin && (
          <span className="text-[10px] px-1 py-px rounded bg-bitcoin/10 text-bitcoin font-medium">
            Admin
          </span>
        )}
        <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
          {timeAgo(comment.createdAt)}
        </span>
      </div>
      <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
        {comment.body}
      </p>

      {isLoggedIn && (
        <button
          onClick={() =>
            onReplyTo(
              isReplyingToThis ? null : { postId, commentId: comment.id }
            )
          }
          className="text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-bitcoin mt-0.5 transition"
        >
          Reply
        </button>
      )}

      {isReplyingToThis && (
        <ReplyForm
          body={replyBody}
          submitting={submitting}
          onChange={onReplyBodyChange}
          onSubmit={onSubmitReply}
          onCancel={() => onReplyTo(null)}
        />
      )}

      {/* Nested replies (comment replies) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2 pl-3 border-l border-neutral-200 dark:border-neutral-800 space-y-2">
          {comment.replies.map((r) => (
            <div key={r.id}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {escapeHtml(r.author.displayName || r.author.pubkey.slice(0, 8) + "...")}
                </span>
                {r.author.isAdmin && (
                  <span className="text-[10px] px-1 py-px rounded bg-bitcoin/10 text-bitcoin font-medium">
                    Admin
                  </span>
                )}
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  {timeAgo(r.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared reply form ───

function ReplyForm({
  body,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: {
  body: string;
  submitting: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2">
      <textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        maxLength={5000}
        className="w-full text-[13px] p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 resize-none focus:outline-none focus:border-bitcoin transition"
      />
      <div className="flex gap-2 mt-1">
        <button
          onClick={onSubmit}
          disabled={submitting || !body.trim()}
          className="text-[12px] font-medium px-3 py-1 rounded-md bg-bitcoin text-white hover:bg-bitcoin-dark disabled:opacity-40 transition"
        >
          {submitting ? "..." : "Reply"}
        </button>
        <button
          onClick={onCancel}
          className="text-[12px] text-neutral-400 hover:text-neutral-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
