"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/constants";
import { useAuth, type AuthUser } from "@/hooks/useAuth";

interface Author {
  id: number;
  pubkey: string;
  displayName: string | null;
  isAdmin: boolean;
  selectedIcon: string | null;
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
  sourceUrl: string;
  sourceSite: string;
  author: Author;
  userVote?: number | null;
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
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function DiscussionWidget({ sourceUrl, sourceSite }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussion = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/discussions?source_url=${encodeURIComponent(sourceUrl)}&source_site=${sourceSite}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setPost(data.post || null);
      setComments(data.comments || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [sourceUrl, sourceSite]);

  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  async function handleSubmit(parentId: number | null = null) {
    const text = parentId ? replyBody : body;
    if (!text.trim() || submitting) return;
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
          body: text.trim(),
          parent_id: parentId,
          lang: "en",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post");
        return;
      }

      // Refresh
      if (parentId) {
        setReplyBody("");
        setReplyTo(null);
      } else {
        setBody("");
      }
      await fetchDiscussion();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(
    targetType: "post" | "comment",
    targetId: number,
    value: number
  ) {
    if (!user?.authenticated) return;

    try {
      await fetch(
        `${API_URL}/board/${targetType === "post" ? "posts" : "comments"}/${targetId}/vote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": (user as AuthUser)?.csrfToken || "",
          },
          body: JSON.stringify({ value }),
        }
      );
      await fetchDiscussion();
    } catch {
      // silent fail
    }
  }

  function totalCommentCount(): number {
    let count = comments.length;
    for (const c of comments) count += c.replies?.length || 0;
    return count;
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

  const count = totalCommentCount();
  const isLoggedIn = user?.authenticated;

  return (
    <div className="sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 scrollbar-thin">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
        Discussion{count > 0 ? ` (${count})` : ""}
      </h4>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isLoggedIn={!!isLoggedIn}
              replyTo={replyTo}
              replyBody={replyBody}
              submitting={submitting}
              onReplyTo={setReplyTo}
              onReplyBodyChange={setReplyBody}
              onSubmitReply={() => handleSubmit(c.id)}
              onVote={handleVote}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs text-red-500 mb-2">{error}</div>
      )}

      {/* Write form */}
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
            onClick={() => handleSubmit(null)}
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

      {/* Link to community (future) */}
      {post && (
        <div className="mt-3 text-center">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
            Powered by TXID Community
          </span>
        </div>
      )}
    </div>
  );
}

// ─── CommentItem ───

function CommentItem({
  comment,
  isLoggedIn,
  replyTo,
  replyBody,
  submitting,
  onReplyTo,
  onReplyBodyChange,
  onSubmitReply,
  onVote,
}: {
  comment: Comment;
  isLoggedIn: boolean;
  replyTo: number | null;
  replyBody: string;
  submitting: boolean;
  onReplyTo: (id: number | null) => void;
  onReplyBodyChange: (v: string) => void;
  onSubmitReply: () => void;
  onVote: (type: "post" | "comment", id: number, value: number) => void;
}) {
  const authorName = comment.author.displayName || comment.author.pubkey.slice(0, 8) + "...";

  return (
    <div>
      <div className="group">
        <div className="flex items-start gap-2">
          {/* Vote */}
          <div className="flex flex-col items-center gap-0.5 mt-0.5 min-w-[24px]">
            <button
              onClick={() =>
                onVote("comment", comment.id, comment.userVote === 1 ? 0 : 1)
              }
              disabled={!isLoggedIn}
              className={`text-xs leading-none p-0.5 rounded transition ${
                comment.userVote === 1
                  ? "text-bitcoin"
                  : "text-neutral-400 dark:text-neutral-600 hover:text-bitcoin"
              } disabled:cursor-default`}
              title="Upvote"
            >
              &#9650;
            </button>
            <span
              className={`text-[11px] font-medium ${
                comment.voteScore > 0
                  ? "text-bitcoin"
                  : comment.voteScore < 0
                    ? "text-red-400"
                    : "text-neutral-400 dark:text-neutral-600"
              }`}
            >
              {comment.voteScore}
            </span>
            <button
              onClick={() =>
                onVote("comment", comment.id, comment.userVote === -1 ? 0 : -1)
              }
              disabled={!isLoggedIn}
              className={`text-xs leading-none p-0.5 rounded transition ${
                comment.userVote === -1
                  ? "text-red-400"
                  : "text-neutral-400 dark:text-neutral-600 hover:text-red-400"
              } disabled:cursor-default`}
              title="Downvote"
            >
              &#9660;
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
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

            {/* Reply button */}
            {isLoggedIn && (
              <button
                onClick={() =>
                  onReplyTo(replyTo === comment.id ? null : comment.id)
                }
                className="text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-bitcoin mt-1 transition"
              >
                Reply
              </button>
            )}

            {/* Reply form */}
            {replyTo === comment.id && (
              <div className="mt-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => onReplyBodyChange(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  maxLength={5000}
                  className="w-full text-[13px] p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 resize-none focus:outline-none focus:border-bitcoin transition"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={onSubmitReply}
                    disabled={submitting || !replyBody.trim()}
                    className="text-[12px] font-medium px-3 py-1 rounded-md bg-bitcoin text-white hover:bg-bitcoin-dark disabled:opacity-40 transition"
                  >
                    {submitting ? "..." : "Reply"}
                  </button>
                  <button
                    onClick={() => onReplyTo(null)}
                    className="text-[12px] text-neutral-400 hover:text-neutral-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-2 pl-3 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {escapeHtml(
                    reply.author.displayName ||
                      reply.author.pubkey.slice(0, 8) + "..."
                  )}
                </span>
                {reply.author.isAdmin && (
                  <span className="text-[10px] px-1 py-px rounded bg-bitcoin/10 text-bitcoin font-medium">
                    Admin
                  </span>
                )}
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  {timeAgo(reply.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
