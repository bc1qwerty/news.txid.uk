import Link from "next/link";
import { format } from "date-fns";
import CategoryBadge from "./CategoryBadge";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group border border-neutral-200 dark:border-border rounded-xl overflow-hidden bg-white dark:bg-surface hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
      <Link href={`/post/${post.slug}`} className="block p-5">
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={post.category} linked={false} />
          <time
            dateTime={post.date}
            className="text-xs text-neutral-400 dark:text-muted"
          >
            {format(new Date(post.date), "MMM d, yyyy")}
          </time>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-bitcoin transition-colors leading-snug mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {post.summary}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400 dark:text-muted">
          <span>{post.readingTime}</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <span>{post.tags.slice(0, 3).join(", ")}</span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
