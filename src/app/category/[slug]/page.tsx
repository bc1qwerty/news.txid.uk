import { notFound } from "next/navigation";
import { CATEGORIES, SITE_URL, type Category } from "@/lib/constants";
import { getPostsByCategory } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug as Category];
  if (!cat) return {};

  return {
    title: cat.name,
    description: cat.description,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${cat.name} | TXID News`,
      description: cat.description,
      url: `${SITE_URL}/category/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slug as Category;

  if (!CATEGORIES[category]) {
    notFound();
  }

  const cat = CATEGORIES[category];
  const posts = getPostsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {cat.name}
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-muted">
          {cat.description}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        <section>
          {posts.length === 0 ? (
            <p className="text-neutral-400 py-12 text-center">
              No posts in this category yet.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 lg:mt-0">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
