"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { API_URL } from "@/lib/constants";

export default function PublishButton({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "confirm" | "publishing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!user?.isAdmin) return null;

  const publish = async () => {
    setStatus("publishing");
    try {
      const res = await fetch(`${API_URL}/news/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": user.csrfToken || "",
        },
        credentials: "include",
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("done");
        setMessage("Published. Deploying...");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to publish");
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status === "idle" && (
        <button
          onClick={() => setStatus("confirm")}
          className="px-5 py-2.5 rounded-lg bg-cat-opinion text-white font-medium text-sm hover:opacity-90 transition"
        >
          Publish
        </button>
      )}
      {status === "confirm" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Publish this post?</span>
          <button
            onClick={publish}
            className="px-3 py-1.5 rounded-lg bg-cat-opinion text-white text-sm font-medium hover:opacity-90 transition"
          >
            Yes
          </button>
          <button
            onClick={() => setStatus("idle")}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-border text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      )}
      {status === "publishing" && (
        <span className="text-sm text-neutral-400">Publishing...</span>
      )}
      {status === "done" && (
        <span className="text-sm text-cat-opinion">{message}</span>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-400">{message}</span>
          <button
            onClick={() => setStatus("idle")}
            className="text-xs text-neutral-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
