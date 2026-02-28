import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aurora = createAuroraClient();
  const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
  const apiKey = process.env.AURORA_API_KEY ?? "";

  if (!baseUrl || !apiKey) {
    notFound();
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
    notFound();
  }

  if (!catalogTableSlug) notFound();

  let record: Record<string, unknown>;

  try {
    record = await aurora.tables(catalogTableSlug).records.get(id);
  } catch {
    notFound();
  }

  const name = getDisplayName(record);
  const priceCents = getPrice(record);
  const imageUrl = getImageUrl(record);
  const skipKeys = ["id", "tenant_id", "created_at", "updated_at", "vendor_id", "vendor_name"];
  const displayEntries = Object.entries(record).filter(
    ([k, v]) =>
      !skipKeys.includes(k) &&
      !["image_url", "image", "photo", "thumbnail"].includes(k) &&
      v !== undefined &&
      v !== null &&
      v !== "" &&
      (typeof v !== "object" || (v !== null && Object.keys(v as object).length > 0))
  );

  return (
    <div className="max-w-6xl mx-auto py-10 sm:py-14 px-4 sm:px-6">
      <Link
        href="/catalogue"
        className="text-aurora-muted hover:text-aurora-accent mb-6 inline-block font-medium"
      >
        ← Back to catalogue
      </Link>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="shrink-0 lg:w-2/5">
          <div className="rounded-component overflow-hidden aspect-square bg-aurora-surface">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-aurora-muted text-6xl">
                —
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
          {priceCents != null && (
            <p className="text-xl font-bold text-aurora-accent">
              {formatPrice(priceCents, currency)}
            </p>
          )}
          {priceCents != null && catalogTableSlug && (
            <AddToCartButton
              recordId={id}
              tableSlug={catalogTableSlug}
              name={name}
              unitAmount={priceCents}
              className="w-full sm:w-auto px-8 py-4 rounded-component bg-aurora-accent text-aurora-bg font-bold hover:opacity-90"
            />
          )}
          {displayEntries.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-aurora-border/50">
              {displayEntries.map(([key, value]) => (
                <div key={key} className="flex gap-4 py-3 border-b border-aurora-border/50 last:border-0">
                  <span className="text-aurora-muted capitalize w-32 shrink-0 text-sm">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-white text-sm">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
