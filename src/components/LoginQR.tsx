"use client";

import { useState, useEffect, useCallback } from "react";

const API = "https://api.txid.uk";

export default function LoginQR({ onLogin }: { onLogin: () => void }) {
  const [qr, setQr] = useState("");
  const [lnurl, setLnurl] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const startLogin = useCallback(async () => {
    try {
      setStatus("loading");
      const res = await fetch(`${API}/auth/challenge`);
      const data = await res.json();
      setQr(data.qr);
      setLnurl(data.lnurl);
      setStatus("ready");

      const es = new EventSource(`${API}/auth/status/${data.k1}`, {
        withCredentials: true,
      });

      es.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.sessionToken) {
          es.close();
          await fetch(`${API}/auth/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: msg.sessionToken }),
          });
          onLogin();
        }
      };

      es.onerror = () => {
        es.close();
      };
    } catch {
      setStatus("error");
    }
  }, [onLogin]);

  useEffect(() => {
    startLogin();
  }, [startLogin]);

  if (status === "loading") {
    return (
      <div className="text-center py-8 text-neutral-400">Loading...</div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 mb-4">Failed to load login</p>
        <button
          onClick={startLogin}
          className="text-sm text-bitcoin hover:text-bitcoin-dark"
        >
          Retry
        </button>
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
          className="mx-auto w-64 h-64 rounded-xl border border-neutral-200 dark:border-border bg-white p-2"
        />
      )}
      <p className="mt-4 text-sm text-neutral-500 dark:text-muted">
        Scan with your Lightning wallet
      </p>
      {lnurl && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(lnurl);
          }}
          className="mt-2 text-xs text-neutral-400 hover:text-bitcoin transition"
        >
          Copy LNURL
        </button>
      )}
    </div>
  );
}
