import Link from "next/link";
import { format } from "date-fns";
import CategoryBadge from "./CategoryBadge";
import type { PostMeta } from "@/lib/posts";

export default function HeroPost({ post }: { post: PostMeta }) {
  return (
    <article className="group border border-neutral-200 dark:border-border rounded-xl overflow-hidden bg-white dark:bg-surface hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <Link href={`/post/${post.slug}`} className="block p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge category={post.category} linked={false} />
          <time
            dateTime={post.date}
            className="text-sm text-neutral-400 dark:text-muted"
          >
            {format(new Date(post.date), "MMMM d, yyyy")}
          </time>
          <span className="text-sm text-neutral-400 dark:text-muted">·</span>
          <span className="text-sm text-neutral-400 dark:text-muted">
            {post.readingTime}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-bitcoin transition-colors leading-tight mb-3">
          {post.title}
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          {post.summary}
        </p>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
