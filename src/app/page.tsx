import Link from "next/link";
import { getAllPosts, getPostsByCategories } from "@/lib/posts";
import { CATEGORIES, SITE_TITLE, SITE_DESCRIPTION, SITE_URL, safeJsonLd, type Category } from "@/lib/constants";
import HeroPost from "@/components/HeroPost";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_TITLE,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-default.png`,
      },
    },
  ],
};

export default function Home() {
  const posts = getAllPosts();
  const byCategory = getPostsByCategories();
  const [heroPost, ...restPosts] = posts;

  if (posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{SITE_TITLE}</h1>
        <p className="text-neutral-500 dark:text-muted">{SITE_DESCRIPTION}</p>
        <p className="mt-8 text-neutral-400">No posts yet. Check back soon.</p>
      </div>
    );
  }

  // Categories that have posts (excluding hero post)
  const categorySections = (Object.keys(CATEGORIES) as Category[])
    .map((key) => ({
      key,
      cat: CATEGORIES[key],
      posts: byCategory[key].filter((p) => p.slug !== heroPost.slug),
    }))
    .filter((s) => s.posts.length > 0);

  const hasEnoughForSections = posts.length >= 4;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="sr-only">
          {SITE_TITLE} — {SITE_DESCRIPTION}
        </h1>

        {/* Hero */}
        <section className="mb-10">
          <HeroPost post={heroPost} />
        </section>

        {/* 2-column layout */}
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          <div>
            {hasEnoughForSections && categorySections.length > 0 ? (
              /* Category sections mode */
              <div className="space-y-10">
                {categorySections.map(({ key, cat, posts: catPosts }) => (
                  <section key={key}>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {cat.name}
                      </h2>
                      <Link
                        href={`/category/${key}`}
                        className="text-sm text-neutral-400 hover:text-bitcoin transition"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {catPosts.slice(0, 4).map((post) => (
                        <PostCard key={post.slug} post={post} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* Simple chronological mode */
              restPosts.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">
                    Recent
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {restPosts.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              )
            )}
          </div>

          <div className="mt-10 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
