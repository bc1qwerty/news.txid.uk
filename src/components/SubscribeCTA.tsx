export default function SubscribeCTA({ variant = "inline" }: { variant?: "inline" | "sidebar" }) {
  if (variant === "sidebar") {
    return (
      <section className="border border-neutral-200 dark:border-border rounded-xl p-5 bg-neutral-50 dark:bg-surface">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          Stay Updated
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
          Bitcoin analysis, macro insights, and political developments.
        </p>
        <a
          href="/feed.xml"
          className="flex items-center justify-center gap-2 w-full text-sm font-medium px-4 py-2 rounded-lg bg-bitcoin text-white hover:bg-bitcoin-dark transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6.18" cy="17.82" r="2.18" />
            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
          </svg>
          Subscribe via RSS
        </a>
      </section>
    );
  }

  return (
    <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-border">
      <div className="rounded-xl border border-neutral-200 dark:border-border bg-neutral-50 dark:bg-surface p-6 text-center">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Enjoyed this analysis?
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-md mx-auto">
          Subscribe to get independent Bitcoin, macro, and politics analysis
          delivered to your feed.
        </p>
        <a
          href="/feed.xml"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-bitcoin text-white hover:bg-bitcoin-dark transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6.18" cy="17.82" r="2.18" />
            <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
          </svg>
          Subscribe via RSS
        </a>
      </div>
    </div>
  );
}
