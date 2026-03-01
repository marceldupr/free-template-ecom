"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useStore } from "@/components/StoreContext";
import { search, createAuroraClient } from "@/lib/aurora";
import type { SearchHit } from "@/lib/aurora";

function getImageUrl(record: Record<string, unknown>): string | null {
  const url = (record as SearchHit).image_url ?? record.image_url ?? record.image ?? record.thumbnail ?? record.photo;
  return url ? String(url) : null;
}

function getPrice(record: Record<string, unknown>): number | undefined {
  const p = (record as SearchHit).price ?? record.price ?? record.amount ?? record.value;
  return p != null ? Number(p) : undefined;
}

function getDisplayName(record: Record<string, unknown>): string {
  const r = record as SearchHit;
  return String(r.name ?? r.title ?? r.snippet ?? record.id ?? "");
}

function formatPrice(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

type TabType = "featured" | "bestsellers" | "new" | "sale";

function CatalogueContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const { store } = useStore();
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("featured");
  const [catalogSlug, setCatalogSlug] = useState<string | null>(null);
  const [currency, setCurrency] = useState("GBP");
  const [page, setPage] = useState(0);
  const limit = 24;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const sort = tab === "new" ? "created_at" : tab === "sale" ? "price" : "name";
      const order = tab === "new" ? "desc" : "asc";
      const res = await search({
        q: "",
        limit,
        offset: page * limit,
        vendorId: store?.id,
        category: category || undefined,
        sort,
        order,
      });
      setHits(res.hits ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setHits([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [store?.id, category, tab, page]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const aurora = createAuroraClient();
        const config = await aurora.store.config();
        if (config.enabled && config.catalogTableSlug) {
          if (!cancelled) {
            setCatalogSlug(config.catalogTableSlug);
            setCurrency((config as { currency?: string }).currency ?? "GBP");
          }
        }
      } catch {
        if (!cancelled) setCatalogSlug("products");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "featured", label: "Featured" },
    { id: "bestsellers", label: "Bestsellers" },
    { id: "new", label: "New Arrivals" },
    { id: "sale", label: "On Sale" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Products</h1>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setPage(0); }}
            className={`px-4 py-2 rounded-component text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-aurora-accent text-aurora-bg"
                : "bg-aurora-surface/80 border border-aurora-border hover:border-aurora-accent/40"
            }`}
          >
            {t.label}
          </button>
        ))}
        {store && (
          <span className="text-aurora-muted text-sm flex items-center gap-1 ml-2">
            🏪 Store products
          </span>
        )}
      </div>

      {store && (
        <p className="text-aurora-muted text-sm mb-4">
          Showing products from {store.name}
        </p>
      )}

      {loading ? (
        <p className="text-aurora-muted py-12 text-center">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {hits.map((record) => {
              const id = (record.recordId ?? record.id) as string;
              const name = getDisplayName(record);
              const rawPrice = getPrice(record);
              const sellByWeight = Boolean(record.sell_by_weight);
              const unit = (record.unit as string) || "kg";
              const pricePerUnit = record.price_per_unit as number | undefined;
              const priceCents =
                sellByWeight && pricePerUnit != null
                  ? Math.round(pricePerUnit * 100)
                  : rawPrice != null
                    ? Math.round(rawPrice * 100)
                    : undefined;
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
                    {(priceCents != null || (sellByWeight && pricePerUnit != null)) && (
                      <p className="text-sm mt-1 font-bold text-aurora-accent">
                        {sellByWeight && pricePerUnit != null
                          ? formatPrice(Math.round(pricePerUnit * 100), currency) + `/${unit}`
                          : formatPrice(priceCents!, currency)}
                      </p>
                    )}
                  </Link>
                  {priceCents != null && catalogSlug && (
                    <div className="mt-3" onClick={(e) => e.preventDefault()}>
                      <AddToCartButton
                        recordId={id}
                        tableSlug={catalogSlug}
                        name={name}
                        unitAmount={priceCents}
                        sellByWeight={sellByWeight}
                        unit={unit}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {hits.length === 0 && (
            <p className="text-center text-aurora-muted py-12">
              No products yet. Add products in Aurora Studio.
            </p>
          )}
          {total > limit && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-component border border-aurora-border disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-aurora-muted">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-4 py-2 rounded-component border border-aurora-border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto py-16 px-6 text-center text-aurora-muted">Loading…</div>}>
      <CatalogueContent />
    </Suspense>
  );
}
