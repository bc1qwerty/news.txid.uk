import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-neutral-300 dark:text-neutral-700 mb-4">
        404
      </h1>
      <p className="text-lg text-neutral-500 dark:text-muted mb-8">
        Page not found.
      </p>
      <Link
        href="/"
        className="text-bitcoin hover:text-bitcoin-dark transition font-medium"
      >
        Back to home
      </Link>
    </div>
  );
}
