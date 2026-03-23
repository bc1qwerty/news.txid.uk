import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { CATEGORIES, SITE_URL, safeJsonLd } from "@/lib/constants";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButtons from "@/components/ShareButtons";
import Sidebar from "@/components/Sidebar";
import ReadingProgress from "@/components/ReadingProgress";
import StickyTOC from "@/components/StickyTOC";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/toc";
import RelatedPosts from "@/components/RelatedPosts";
import SubscribeCTA from "@/components/SubscribeCTA";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/post/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `${SITE_URL}/post/${post.slug}`,
      images: [
        {
          url: post.thumbnail || "/og-default.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [post.thumbnail || "/og-default.png"],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const cat = CATEGORIES[post.category];
  const headings = extractHeadings(post.content);
  const hasTOC = headings.length >= 3;
  const related = getRelatedPosts(post.slug, post.category);
  const wordCount = post.content.split(/\s+/).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/post/${post.slug}`,
        headline: post.title,
        description: post.summary,
        datePublished: post.date,
        dateModified: post.date,
        wordCount,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/post/${post.slug}`,
        },
        image: {
          "@type": "ImageObject",
          url: `${SITE_URL}${post.thumbnail || "/og-default.png"}`,
        },
        author: {
          "@type": "Person",
          name: post.author,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "TXID News",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/og-default.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: cat.name,
            item: `${SITE_URL}/category/${post.category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${SITE_URL}/post/${post.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <ReadingProgress />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          className={`lg:grid lg:gap-10 ${
            hasTOC
              ? "xl:grid-cols-[200px_1fr_280px] lg:grid-cols-[1fr_280px]"
              : "lg:grid-cols-[1fr_280px]"
          }`}
        >
          {/* Left TOC — xl only */}
          {hasTOC && (
            <div className="hidden xl:block">
              <StickyTOC headings={headings} />
            </div>
          )}

          {/* Article */}
          <article className="min-w-0">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-neutral-400 dark:text-muted mb-6"
            >
              <Link
                href="/"
                className="hover:text-neutral-900 dark:hover:text-white transition"
              >
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/category/${post.category}`}
                className="hover:text-neutral-900 dark:hover:text-white transition"
              >
                {cat.name}
              </Link>
            </nav>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CategoryBadge category={post.category} />
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

            {/* Collapsible TOC — below xl fallback */}
            {hasTOC && (
              <div className="xl:hidden">
                <TableOfContents headings={headings} />
              </div>
            )}

            {/* Content */}
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

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-border">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-border">
              <ShareButtons slug={post.slug} title={post.title} />
            </div>

            {/* Subscribe CTA */}
            <SubscribeCTA />

            {/* Related Posts */}
            <RelatedPosts posts={related} />
          </article>

          {/* Right Sidebar */}
          <div className="mt-10 lg:mt-0">
            <Sidebar currentSlug={post.slug} />
          </div>
        </div>
      </div>
    </>
  );
}
