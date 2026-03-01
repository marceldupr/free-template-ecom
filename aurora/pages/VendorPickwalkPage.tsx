"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Check, Loader2, Package, Scan } from "lucide-react";

export type PickwalkItem = {
  order_item_id: string;
  product_id: string;
  quantity: number;
  ean?: string;
  product_name: string;
  picked_at?: string;
};

export type PickwalkZone = {
  zone: { id: string; slug: string; name: string };
  items: PickwalkItem[];
};

export interface VendorPickwalkPageProps {
  tenant: string;
  orderId: string;
  fetchWithAuth: (path: string, options?: RequestInit) => Promise<Response>;
  Link: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }>;
}

export default function VendorPickwalkPage({
  tenant,
  orderId,
  fetchWithAuth,
  Link,
}: VendorPickwalkPageProps) {
  const [zones, setZones] = useState<PickwalkZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const [scanValue, setScanValue] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  const loadPickwalk = useCallback(() => {
    if (!tenant || !orderId) return;
    setLoading(true);
    setError(null);
    fetchWithAuth(`/api/tenants/${tenant}/vendor/orders/${orderId}/pickwalk`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body?.error ?? `Failed to load pickwalk (${r.status})`);
        }
        return r.json();
      })
      .then((data) => setZones(data?.data ?? []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load pickwalk")
      )
      .finally(() => setLoading(false));
  }, [tenant, orderId, fetchWithAuth]);

  useEffect(() => {
    loadPickwalk();
  }, [loadPickwalk]);

  async function handleMarkPicked(item: PickwalkItem) {
    if (!tenant || !orderId || picking) return;
    setPicking(item.order_item_id);
    try {
      const r = await fetchWithAuth(
        `/api/tenants/${tenant}/vendor/orders/${orderId}/items/${item.order_item_id}/pick`,
        { method: "POST" }
      );
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to mark picked");
      }
      loadPickwalk();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark picked");
    } finally {
      setPicking(null);
    }
  }

  function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ean = scanValue.trim().toUpperCase();
    if (!ean) return;
    const item = zones.flatMap((z) => z.items).find(
      (i) => i.ean && i.ean.toUpperCase() === ean && !i.picked_at
    );
    if (item) {
      handleMarkPicked(item);
      setScanValue("");
      scanInputRef.current?.focus();
    } else {
      setError("No matching unpicked item for EAN " + ean);
      setTimeout(() => setError(null), 3000);
    }
  }

  const totalItems = zones.reduce((n, z) => n + z.items.length, 0);
  const pickedCount = zones.reduce(
    (n, z) => n + z.items.filter((i) => i.picked_at).length,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-aurora-muted py-12">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading pickwalk…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href={`/${tenant}/vendor/orders/${orderId}`} className="p-2 rounded-component hover:bg-aurora-surface border border-transparent hover:border-aurora-border">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-h2 flex items-center gap-2">
            <Package className="w-6 h-6 text-aurora-accent" />
            Pickwalk
          </h1>
          <p className="text-aurora-muted text-sm">
            Order #{String(orderId).slice(0, 8)} · {pickedCount}/{totalItems} picked
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-component bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleScanSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-component bg-aurora-surface border border-aurora-border px-3 py-2">
          <Scan className="w-4 h-4 text-aurora-muted" />
          <input
            ref={scanInputRef}
            type="text"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            placeholder="Scan EAN / barcode"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-aurora-muted"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={!scanValue.trim()}
          className="px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          Scan
        </button>
      </form>

      {zones.length === 0 ? (
        <div className="rounded-card bg-aurora-surface border border-aurora-border p-8 text-center text-aurora-muted">
          <p>No items to pick for this order.</p>
          <Link href={`/${tenant}/vendor/orders/${orderId}`} className="mt-4 inline-block text-aurora-accent hover:underline">
            Back to order
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {zones.map(({ zone, items }) => (
            <div
              key={zone.id || zone.slug}
              className="rounded-card bg-aurora-surface border border-aurora-border overflow-hidden"
            >
              <div className="px-4 py-3 bg-aurora-bg border-b border-aurora-border font-semibold">
                {zone.name}
              </div>
              <ul className="divide-y divide-aurora-border">
                {items.map((item) => {
                  const isPicked = !!item.picked_at;
                  const isPicking = picking === item.order_item_id;
                  return (
                    <li key={item.order_item_id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className={isPicked ? "text-aurora-muted line-through" : "font-medium"}>
                          {item.quantity}× {item.product_name}
                        </p>
                        {item.ean && (
                          <p className="text-xs text-aurora-muted mt-0.5">EAN {item.ean}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isPicked ? (
                          <span className="flex items-center gap-1.5 text-sm text-green-500">
                            <Check className="w-4 h-4" />
                            Picked
                            {item.picked_at && (
                              <span className="text-aurora-muted">
                                {new Date(item.picked_at).toLocaleTimeString()}
                              </span>
                            )}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkPicked(item)}
                            disabled={isPicking}
                            className="flex items-center gap-2 px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium text-sm hover:opacity-90 disabled:opacity-50"
                          >
                            {isPicking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Mark picked
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
