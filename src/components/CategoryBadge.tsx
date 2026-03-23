import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/constants";

export default function CategoryBadge({
  category,
  linked = true,
}: {
  category: Category;
  linked?: boolean;
}) {
  const cat = CATEGORIES[category];
  const colorMap: Record<Category, string> = {
    bitcoin: "bg-cat-bitcoin/15 text-cat-bitcoin",
    macro: "bg-cat-macro/15 text-cat-macro",
    politics: "bg-cat-politics/15 text-cat-politics",
    opinion: "bg-cat-opinion/15 text-cat-opinion",
  };

  const classes = `inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap[category]}`;

  if (!linked) {
    return <span className={classes}>{cat.name}</span>;
  }

  return (
    <Link href={`/category/${category}`} className={classes}>
      {cat.name}
    </Link>
  );
}
