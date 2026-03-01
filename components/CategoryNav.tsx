import Link from "next/link";
import { createAuroraClient } from "@/lib/aurora";

const DEFAULT_CATEGORIES = [
  { name: "Bakery Items", slug: "bakery-items" },
  { name: "Frozen Foods", slug: "frozen-foods" },
  { name: "Vegetables", slug: "vegetables" },
  { name: "Fruits", slug: "fruits" },
  { name: "Dairy Products", slug: "dairy-products" },
  { name: "Snacks", slug: "snacks" },
  { name: "Beverages", slug: "beverages" },
];

export async function CategoryNav() {
  let categories: { name: string; slug: string }[] = DEFAULT_CATEGORIES;

  try {
    const aurora = createAuroraClient();
    const config = await aurora.store.config();
    const categorySlug = (config as { categoryTableSlug?: string }).categoryTableSlug;
    if (config.enabled && categorySlug) {
      const { data } = await aurora.tables(categorySlug).records.list({
        limit: 20,
      });
      if (data?.length) {
        categories = data.map((r: Record<string, unknown>) => ({
          name: String(r.name ?? r.slug ?? r.id ?? ""),
          slug: String(r.slug ?? r.name ?? r.id ?? "").toLowerCase().replace(/\s+/g, "-"),
        }));
      }
    }
  } catch {
    // use defaults
  }

  return (
    <div className="border-b border-aurora-border overflow-x-auto">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalogue?category=${encodeURIComponent(cat.slug)}`}
            className="shrink-0 px-4 py-2 rounded-component bg-aurora-surface/80 border border-aurora-border hover:border-aurora-accent/40 text-sm font-medium transition-colors whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
