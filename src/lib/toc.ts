export interface TocItem {
  text: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractHeadings(content: string): TocItem[] {
  const regex = /^##\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[1].replace(/\*\*/g, "").trim();
    headings.push({ text, slug: slugify(text) });
  }
  return headings;
}
