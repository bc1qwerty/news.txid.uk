"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/lib/constants";

export default function LoginQR({ onLogin }: { onLogin: () => void }) {
  const [qr, setQr] = useState("");
  const [lnurl, setLnurl] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API_URL}/auth/challenge`);
        const data = await res.json();
        if (cancelled) return;
        setQr(data.qr);
        setLnurl(data.lnurl);
        setStatus("ready");

        const es = new EventSource(`${API_URL}/auth/status/${data.k1}`, {
          withCredentials: true,
        });
        esRef.current = es;

        es.onmessage = async (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (typeof msg.sessionToken === "string" && msg.sessionToken) {
              es.close();
              await fetch(`${API_URL}/auth/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: msg.sessionToken }),
              });
              onLogin();
            }
          } catch {
            // ignore malformed SSE messages
          }
        };

        es.onerror = () => {
          es.close();
        };
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      esRef.current?.close();
    };
  }, [onLogin]);

  if (status === "loading") {
    return (
      <div className="text-center py-8 text-neutral-400">Loading...</div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 mb-4">Failed to load login</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Lightning Login
      </h2>
      {qr && (
        <img
          src={qr}
          alt="LNURL-auth QR code"
          width={256}
          height={256}
          className="mx-auto rounded-xl border border-neutral-200 dark:border-border bg-white p-2"
        />
      )}
      <p className="mt-4 text-sm text-neutral-500 dark:text-muted">
        Scan with your Lightning wallet
      </p>
      {lnurl && (
        <button
          onClick={() => navigator.clipboard?.writeText(lnurl)}
          className="mt-2 text-xs text-neutral-400 hover:text-bitcoin transition"
        >
          Copy LNURL
        </button>
      )}
    </div>
  );
}
