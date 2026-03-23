import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Category } from "./constants";
import { CATEGORIES } from "./constants";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: Category;
  tags: string[];
  summary: string;
  thumbnail?: string;
  author: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

interface RawPost extends Post {
  draft: boolean;
}

function readAllPosts(): RawPost[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const files = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString().split("T")[0],
        draft: data.draft === true,
        category: (data.category as Category) || "opinion",
        tags: data.tags || [],
        summary: data.summary || "",
        thumbnail: data.thumbnail,
        author: data.author || "txid",
        readingTime: stats.text,
        content,
      };
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getAllPosts(): Post[] {
  return readAllPosts().filter((p) => !p.draft);
}

export function getAllDrafts(): Post[] {
  return readAllPosts().filter((p) => p.draft);
}

export function getDraftBySlug(slug: string): Post | undefined {
  return getAllDrafts().find((p) => p.slug === slug);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: Category): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRecentPosts(limit = 5, excludeSlug?: string): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit)
    .map(({ content: _, ...meta }) => meta);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedPosts(
  currentSlug: string,
  category: Category,
  limit = 3
): PostMeta[] {
  const posts = getAllPosts();
  const sameCat = posts
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);

  if (sameCat.length >= limit) {
    return sameCat.map(({ content: _, ...meta }) => meta);
  }

  const remaining = limit - sameCat.length;
  const others = posts
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        p.category !== category &&
        !sameCat.find((s) => s.slug === p.slug)
    )
    .slice(0, remaining);

  return [...sameCat, ...others].map(({ content: _, ...meta }) => meta);
}

export function getPostsByCategories(): Record<Category, PostMeta[]> {
  const posts = getAllPosts();
  const result = {} as Record<Category, PostMeta[]>;
  for (const key of Object.keys(CATEGORIES) as Category[]) {
    result[key] = posts
      .filter((p) => p.category === key)
      .map(({ content: _, ...meta }) => meta);
  }
  return result;
}

export function getCategoryCounts(): Record<Category, number> {
  const posts = getAllPosts();
  const counts = {} as Record<Category, number>;
  for (const key of Object.keys(CATEGORIES)) {
    counts[key as Category] = posts.filter((p) => p.category === key).length;
  }
  return counts;
}
