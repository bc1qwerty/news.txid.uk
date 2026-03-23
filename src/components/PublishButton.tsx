"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const API = "https://api.txid.uk";

export default function PublishButton({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "publishing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!user?.isAdmin) return null;

  const publish = async () => {
    if (!confirm("Publish this post? It will be visible to everyone.")) return;

    setStatus("publishing");
    try {
      const res = await fetch(`${API}/news/publish`, {
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
          onClick={publish}
          className="px-5 py-2.5 rounded-lg bg-cat-opinion text-white font-medium text-sm hover:opacity-90 transition"
        >
          Publish
        </button>
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
