import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/constants";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ slug: tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);

  return {
    title: `Posts tagged "${tag}"`,
    description: `Articles and analysis tagged with "${tag}" on TXID News.`,
    alternates: {
      canonical: `/tag/${encodeURIComponent(tag)}`,
    },
    openGraph: {
      title: `${tag} | TXID News`,
      description: `Articles and analysis tagged with "${tag}" on TXID News.`,
      url: `${SITE_URL}/tag/${encodeURIComponent(tag)}`,
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {tag}
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-muted">
          {posts.length} post{posts.length !== 1 ? "s" : ""} tagged with
          &ldquo;{tag}&rdquo;
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        <section>
          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <div className="mt-10 lg:mt-0">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
