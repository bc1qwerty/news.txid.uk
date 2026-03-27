#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

// Find new or modified MDX files in posts directory
const status = run("git status --porcelain src/content/posts/");
if (!status) {
  console.log("No new or modified drafts to push.");
  process.exit(0);
}

const files = status
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.endsWith(".mdx"))
  .map((line) => line.replace(/^[A-Z?]+\s+/, ""));

if (files.length === 0) {
  console.log("No MDX changes found.");
  process.exit(0);
}

console.log(`\nPushing ${files.length} draft(s) to GitHub:\n`);
files.forEach((f) => console.log(`  + ${path.basename(f)}`));

// Stage only the MDX files
files.forEach((f) => run(`git add "${f}"`));

// Commit
const slugs = files.map((f) => path.basename(f, ".mdx")).join(", ");
const msg = files.length === 1
  ? `draft: ${path.basename(files[0], ".mdx")}`
  : `drafts: ${files.length} new posts`;

run(`git commit -m "${msg}"`);
console.log(`\nCommitted: ${msg}`);

// Pull first (rebase to keep history clean), then push
try {
  run("git pull --rebase origin main");
} catch {
  console.error("Pull failed — resolve conflicts manually, then retry.");
  process.exit(1);
}
run("git push origin main");
console.log("Pushed to GitHub — admin dashboard will show new drafts.\n");
