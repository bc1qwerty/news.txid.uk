import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { getAllDrafts, getDraftBySlug } from "@/lib/posts";
import { CATEGORIES } from "@/lib/constants";
import CategoryBadge from "@/components/CategoryBadge";
import StickyTOC from "@/components/StickyTOC";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/toc";
import PublishButton from "@/components/PublishButton";
import type { Metadata } from "next";

export const dynamic = "force-static";

export function generateStaticParams() {
  const drafts = getAllDrafts();
  // Always include the base path (no slug) + all draft slugs
  return [{ slug: [] }, ...drafts.map((d) => ({ slug: [d.slug] }))];
}

export function generateMetadata(): Metadata {
  return {
    title: "Draft Preview",
    robots: { index: false, follow: false },
  };
}

export default async function DraftPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  // /draft → redirect to admin
  if (!slug || slug.length === 0) {
    redirect("/admin");
  }

  const postSlug = slug[0];
  const post = getDraftBySlug(postSlug);

  if (!post) {
    redirect("/admin");
  }

  const cat = CATEGORIES[post.category];
  const headings = extractHeadings(post.content);
  const hasTOC = headings.length >= 3;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Draft Banner */}
      <div className="mb-6 p-4 rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-50 dark:bg-amber-900/10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-amber-400 text-amber-950 text-sm font-bold">
            DRAFT
          </span>
          <span className="text-sm text-amber-700 dark:text-amber-400">
            This post is not published yet.
          </span>
        </div>
        <PublishButton slug={postSlug} />
      </div>

      <div
        className={`lg:grid lg:gap-10 ${
          hasTOC
            ? "xl:grid-cols-[200px_1fr] lg:grid-cols-[1fr]"
            : "lg:grid-cols-[1fr]"
        }`}
      >
        {hasTOC && (
          <div className="hidden xl:block">
            <StickyTOC headings={headings} />
          </div>
        )}

        <article className="min-w-0 max-w-3xl">
          <nav className="text-sm text-neutral-400 dark:text-muted mb-6">
            <Link
              href="/admin"
              className="hover:text-neutral-900 dark:hover:text-white transition"
            >
              Admin
            </Link>
            <span className="mx-2">/</span>
            <span>Draft Preview</span>
          </nav>

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CategoryBadge category={post.category} linked={false} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-muted">
              <time dateTime={post.date}>
                {format(new Date(post.date), "MMMM d, yyyy")}
              </time>
              <span>·</span>
              <span>{post.readingTime}</span>
              <span>·</span>
              <span>by {post.author}</span>
            </div>
          </header>

          {hasTOC && (
            <div className="xl:hidden">
              <TableOfContents headings={headings} />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
