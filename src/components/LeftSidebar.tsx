import Link from "next/link";
import { format } from "date-fns";
import { CATEGORIES, type Category } from "@/lib/constants";
import { getRecentPosts, getAllTags, getCategoryCounts } from "@/lib/posts";

export default function LeftSidebar({
  currentSlug,
}: {
  currentSlug?: string;
}) {
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
    <aside className="sticky top-20 self-start space-y-6">
      {/* Categories */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          Categories
        </h4>
        <ul className="space-y-1">
          {(Object.keys(CATEGORIES) as Category[]).map((key) => (
            <li key={key}>
              <Link
                href={`/category/${key}`}
                className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition py-0.5"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${catColorDot[key]}`}
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
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
            Recent
          </h4>
          <ul className="space-y-2">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/post/${post.slug}`} className="group block">
                  <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-bitcoin transition leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <time className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5 block">
                    {format(new Date(post.date), "MMM d")}
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
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 15).map(({ tag }) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* NIP-05 Identity */}
      <a
        href="https://id.txid.uk/en/"
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 rounded-xl border border-bitcoin/20 bg-bitcoin/5 hover:bg-bitcoin/10 transition group"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">⚡</span>
          <span className="text-xs font-semibold text-bitcoin">NIP-05 Identity</span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-1.5">
          Get <span className="text-bitcoin font-mono font-medium">you@txid.uk</span>
        </p>
        <span className="text-[10px] text-bitcoin group-hover:underline">
          Register →
        </span>
      </a>
    </aside>
  );
}
