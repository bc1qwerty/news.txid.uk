#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const CATEGORIES = ["bitcoin", "macro", "politics", "opinion"];

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: npm run new -- \"Post Title\" [--category bitcoin]");
  console.log("Categories:", CATEGORIES.join(", "));
  process.exit(1);
}

// Parse arguments
let title = "";
let category = "opinion";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--category" || args[i] === "-c") {
    category = args[++i];
  } else if (!args[i].startsWith("-")) {
    title = args[i];
  }
}

if (!title) {
  console.error("Error: Title is required");
  process.exit(1);
}

if (!CATEGORIES.includes(category)) {
  console.error(`Error: Invalid category "${category}". Use: ${CATEGORIES.join(", ")}`);
  process.exit(1);
}

// Generate slug and filename
const today = new Date().toISOString().split("T")[0];
const slug = title
  .toLowerCase()
  .replace(/[^\w\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .trim()
  .slice(0, 60);

const filename = `${today}-${slug}.mdx`;
const filepath = path.join(__dirname, "..", "src", "content", "posts", filename);

if (fs.existsSync(filepath)) {
  console.error(`Error: File already exists: ${filename}`);
  process.exit(1);
}

const template = `---
title: "${title}"
date: "${today}"
category: "${category}"
tags: []
summary: ""
author: "txid"
draft: true
---

`;

fs.writeFileSync(filepath, template);
console.log(`Created: src/content/posts/${filename}`);
console.log(`Category: ${category}`);
console.log(`Status: DRAFT (will not be published)`);
console.log(`\nWhen ready to publish:`);
console.log(`  1. Set "draft: false" in the frontmatter`);
console.log(`  2. Run \`npm run deploy\` or push to GitHub`);
