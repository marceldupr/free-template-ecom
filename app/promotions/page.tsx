import Link from "next/link";
import { createAuroraClient } from "@/lib/aurora";
import { AddToCartButton } from "@/components/AddToCartButton";
import { StoreContextBar } from "@/components/StoreContextBar";

export const dynamic = "force-dynamic";

function getImageUrl(record: Record<string, unknown>): string | null {
  const field = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  return field ? String(record[field]) : null;
}

function getPrice(record: Record<string, unknown>): number | undefined {
  if (record.on_sale && record.sale_price != null) return Number(record.sale_price);
  const field = ["price", "amount", "value"].find((f) => record[f] != null);
  return field ? Number(record[field]) : undefined;
}

function getDisplayName(record: Record<string, unknown>): string {
  return String(record.name ?? record.title ?? record.id ?? "");
}

function formatPrice(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function PromotionsPage() {
  let records: Record<string, unknown>[] = [];
  let catalogTableSlug: string | null = null;
  let currency = "GBP";

  try {
    const aurora = createAuroraClient();
    const config = await aurora.store.config();
    if (config.enabled && config.catalogTableSlug) {
      catalogTableSlug = config.catalogTableSlug;
      currency = (config as { currency?: string }).currency ?? "GBP";
      const result = await aurora.tables(catalogTableSlug).records.list({
        limit: 48,
        sort: "created_at",
        order: "desc",
      });
      records = (result.data ?? []).filter(
        (r: Record<string, unknown>) => r.on_sale === true || r.sale_price != null
      );
      if (records.length === 0) {
        records = (result.data ?? []).slice(0, 12);
      }
    }
  } catch {
    return (
      <div className="max-w-6xl mx-auto py-16 px-6 text-center">
        <p className="text-aurora-muted">
          Unable to load promotions. Configure your store in Aurora Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <StoreContextBar />
      <div className="py-12 px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-2">Promotions</h1>
        <p className="text-aurora-muted mb-8">
          Store-specific offers and deals.
        </p>
        {records.length === 0 ? (
          <p className="text-aurora-muted py-12">
            No promotions at the moment. Add products with on_sale in Aurora Studio.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {records.map((record) => {
              const id = String(record.id ?? "");
              const name = getDisplayName(record);
              const priceCents = getPrice(record);
              const imageUrl = getImageUrl(record);
              const isOnSale = record.on_sale === true;

              return (
                <div
                  key={id}
                  className="p-4 rounded-component bg-aurora-surface/80 border border-aurora-border hover:border-aurora-accent/40 transition-all"
                >
                  {isOnSale && (
                    <span className="inline-block px-2 py-0.5 rounded bg-aurora-accent/20 text-aurora-accent text-xs font-medium mb-2">
                      On Sale
                    </span>
                  )}
                  <Link href={`/catalogue/${id}`}>
                    <div className="aspect-square rounded-component bg-aurora-surface-hover mb-3 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-aurora-muted text-4xl">
                          —
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-sm truncate">{name}</p>
                    {priceCents != null && (
                      <p className="text-sm mt-1 font-bold text-aurora-accent">
                        {formatPrice(priceCents, currency)}
                      </p>
                    )}
                  </Link>
                  {priceCents != null && catalogTableSlug && (
                    <div className="mt-3" onClick={(e) => e.preventDefault()}>
                      <AddToCartButton
                        recordId={id}
                        tableSlug={catalogTableSlug}
                        name={name}
                        unitAmount={priceCents}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
