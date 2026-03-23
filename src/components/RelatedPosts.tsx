import Link from "next/link";
import { format } from "date-fns";
import CategoryBadge from "./CategoryBadge";
import type { PostMeta } from "@/lib/posts";

export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-neutral-200 dark:border-border">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">
        Related
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/post/${post.slug}`}
            className="group block p-4 rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-surface hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={post.category} linked={false} />
              <time dateTime={post.date} className="text-xs text-neutral-400 dark:text-muted">
                {format(new Date(post.date), "MMM d")}
              </time>
            </div>
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-bitcoin transition leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
