import Link from "next/link";
import { createAuroraClient } from "@/lib/aurora";
import { AddToCartButton } from "@/components/AddToCartButton";

function getImageUrl(record: Record<string, unknown>): string | null {
  const field = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  return field ? String(record[field]) : null;
}

function getPrice(record: Record<string, unknown>): number | undefined {
  const field = ["price", "amount", "value"].find((f) => record[f] != null);
  return field ? Number(record[field]) : undefined;
}

function getDisplayName(record: Record<string, unknown>): string {
  const field = ["name", "title", "slug"].find((f) => record[f]) ?? "id";
  return String(record[field] ?? record.id ?? "");
}

function formatPrice(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function CataloguePage() {
  const aurora = createAuroraClient();
  const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
  const apiKey = process.env.AURORA_API_KEY ?? "";

  if (!baseUrl || !apiKey) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6 text-center">
        <p className="text-aurora-muted">
          Configure NEXT_PUBLIC_AURORA_API_URL and AURORA_API_KEY to load the catalogue.
        </p>
      </div>
    );
  }

  let catalogTableSlug: string | null = null;
  let currency = "GBP";

  try {
    const config = await aurora.store.config();
    if (config.enabled && config.catalogTableSlug) {
      catalogTableSlug = config.catalogTableSlug;
      currency = (config as { currency?: string }).currency ?? "GBP";
    }
  } catch {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6 text-center">
        <p className="text-aurora-muted">Unable to load store config. Check your API key.</p>
      </div>
    );
  }

  if (!catalogTableSlug) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6 text-center">
        <p className="text-aurora-muted">No catalogue configured. Set up commerce in Aurora Studio.</p>
      </div>
    );
  }

  let records: Record<string, unknown>[] = [];
  let total = 0;

  try {
    const result = await aurora.tables(catalogTableSlug).records.list({
      limit: 24,
      offset: 0,
      sort: "created_at",
      order: "desc",
    });
    records = result.data ?? [];
    total = result.total ?? 0;
  } catch {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6">
        <p className="text-aurora-muted">Unable to load products.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 tracking-tight">Catalogue</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {records.map((record) => {
          const id = String(record.id ?? "");
          const name = getDisplayName(record);
          const priceCents = getPrice(record);
          const imageUrl = getImageUrl(record);

          return (
            <div
              key={id}
              className="group p-4 rounded-component bg-aurora-surface/80 border border-aurora-border hover:border-aurora-accent/40 hover:shadow-lg transition-all overflow-hidden"
            >
              <Link href={`/catalogue/${id}`} className="block">
                <div className="aspect-square rounded-component bg-aurora-surface-hover mb-3 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-aurora-muted text-4xl">
                      —
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm sm:text-base truncate group-hover:text-aurora-accent transition-colors">
                  {name}
                </p>
                {priceCents != null && (
                  <p className="text-sm mt-1 font-bold text-aurora-accent">
                    {formatPrice(priceCents, currency)}
                  </p>
                )}
              </Link>
              {priceCents != null && (
                <div className="mt-3" onClick={(e) => e.preventDefault()}>
                  <AddToCartButton
                    recordId={id}
                    tableSlug={catalogTableSlug!}
                    name={name}
                    unitAmount={priceCents}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {records.length === 0 && (
        <p className="text-center text-aurora-muted py-12">
          No products yet. Add products in Aurora Studio.
        </p>
      )}
    </div>
  );
}
