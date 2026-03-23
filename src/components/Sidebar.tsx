import Link from "next/link";
import { format } from "date-fns";
import { CATEGORIES, type Category } from "@/lib/constants";
import { getRecentPosts, getAllTags, getCategoryCounts } from "@/lib/posts";
import SubscribeCTA from "./SubscribeCTA";

export default function Sidebar({ currentSlug }: { currentSlug?: string }) {
  const recentPosts = getRecentPosts(5, currentSlug);
  const categoryCounts = getCategoryCounts();
  const tags = getAllTags();

  const catColorDot: Record<Category, string> = {
    bitcoin: "bg-cat-bitcoin",
    macro: "bg-cat-macro",
    politics: "bg-cat-politics",
    opinion: "bg-cat-opinion",
  };

  return (
    <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
      {/* Categories */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
          Categories
        </h3>
        <ul className="space-y-1.5">
          {(Object.keys(CATEGORIES) as Category[]).map((key) => (
            <li key={key}>
              <Link
                href={`/category/${key}`}
                className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition py-1"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${catColorDot[key]}`}
                  />
                  {CATEGORIES[key].name}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-600">
                  {categoryCounts[key]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
            Recent
          </h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/post/${post.slug}`}
                  className="group block"
                >
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-bitcoin transition leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <time className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5 block">
                    {format(new Date(post.date), "MMM d, yyyy")}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag }) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Subscribe CTA */}
      <SubscribeCTA variant="sidebar" />

      {/* About */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          About
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2">
          Independent analysis of Bitcoin, macro economics, and politics. No altcoins. No noise.
        </p>
        <Link
          href="/about"
          className="text-sm text-bitcoin hover:text-bitcoin-dark transition"
        >
          Read more
        </Link>
      </section>
    </aside>
  );
}
