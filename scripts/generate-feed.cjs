const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SITE_URL = "https://news.txid.uk";
const SITE_TITLE = "TXID News";
const SITE_DESCRIPTION =
  "Bitcoin, Macro Economics & Politics — Independent Analysis";

const postsDir = path.join(__dirname, "..", "src", "content", "posts");
const outFile = path.join(__dirname, "..", "public", "feed.xml");

const files = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".mdx"))
  .sort()
  .reverse();

const posts = files
  .map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(content);
    return { slug: file.replace(".mdx", ""), ...data };
  })
  .filter((p) => p.draft !== true);

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const items = posts
  .map(
    (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE_URL}/post/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/post/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.summary || ""}]]></description>
      <category>${escapeXml(p.category)}</category>
    </item>`
  )
  .join("");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, rss.trim());
console.log("RSS feed generated:", outFile);

// Generate drafts.json for admin page
const allPosts = files.map((file) => {
  const content = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data } = matter(content);
  return { slug: file.replace(".mdx", ""), ...data };
});

const drafts = allPosts
  .filter((p) => p.draft === true)
  .map((p) => ({
    slug: p.slug,
    title: p.title || p.slug,
    date: p.date || "",
    category: p.category || "opinion",
    summary: p.summary || "",
  }));

const draftsDir = path.join(__dirname, "..", "public", "admin");
fs.mkdirSync(draftsDir, { recursive: true });
fs.writeFileSync(
  path.join(draftsDir, "drafts.json"),
  JSON.stringify(drafts, null, 2)
);
console.log("Drafts JSON generated:", drafts.length, "drafts");
