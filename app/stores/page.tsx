"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreContext";
import type { StoreItem } from "@/lib/aurora";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)}km away`;
}

export default function StoresPage() {
  const { location, setStore } = useStore();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/stores").then((r) => r.json());
        if (cancelled) return;
        if (res.error) {
          setError(res.error);
          setStores([]);
          return;
        }
        let list = res.data ?? [];
        if (location && list.length > 0) {
          const userLat = location.lat;
          const userLng = location.lng;
          list = list
            .map((s) => {
              const loc = s.location as { coordinates?: [number, number] } | undefined;
              const coords = loc?.coordinates;
              const lat = Array.isArray(coords) ? coords[1] : undefined;
              const lng = Array.isArray(coords) ? coords[0] : undefined;
              const dist =
                lat != null && lng != null
                  ? haversineDistance(userLat, userLng, lat, lng)
                  : null;
              return { ...s, _distance: dist };
            })
            .sort((a, b) => (a._distance ?? Infinity) - (b._distance ?? Infinity));
        }
        setStores(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load stores");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [location]);

  const handleSelectStore = (s: StoreItem) => {
    setStore({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      image_url: s.image_url,
    });
    window.location.href = "/";
  };

  const locationAddress = location?.address ?? "Waterloo Station, London SE1, UK";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 border-b border-aurora-border bg-aurora-bg/95 flex items-center gap-4">
        <Link href="/location" className="text-aurora-muted hover:text-white" aria-label="Back">
          ←
        </Link>
        <h1 className="text-xl font-bold flex-1">Nearby Stores</h1>
        <Link href="/" className="text-aurora-muted hover:text-white" aria-label="Home">
          🏠
        </Link>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-aurora-muted text-sm mb-1">
            <span>📍</span>
            <span>{locationAddress}</span>
          </div>
          <Link
            href="/location"
            className="text-aurora-accent hover:underline text-sm font-medium"
          >
            Change Location
          </Link>
        </div>

        {loading && (
          <p className="text-aurora-muted py-8 text-center">Loading stores…</p>
        )}
        {error && (
          <p className="text-red-400 py-8 text-center">
            {error}. Configure NEXT_PUBLIC_AURORA_API_URL and AURORA_API_KEY.
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="text-aurora-muted text-sm mb-4">
              Found {stores.length} store{stores.length !== 1 ? "s" : ""} near your location
            </p>
            <div className="space-y-4">
              {stores.map((s) => {
                const dist = (s as StoreItem & { _distance?: number })._distance;
                return (
                  <div
                    key={s.id}
                    className="rounded-component bg-aurora-surface border border-aurora-border overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {s.image_url && (
                        <div className="sm:w-48 h-32 sm:h-auto bg-aurora-surface-hover shrink-0">
                          <img
                            src={s.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-bold text-lg">{s.name}</h2>
                          {dist != null && (
                            <span className="shrink-0 px-2 py-1 rounded-component bg-aurora-surface-hover text-xs text-aurora-muted">
                              {formatDistance(dist)}
                            </span>
                          )}
                        </div>
                        {s.address && (
                          <p className="text-aurora-muted text-sm flex items-center gap-2">
                            <span>📍</span> {s.address}
                          </p>
                        )}
                        <div className="flex gap-2 mt-auto">
                          <button
                            type="button"
                            onClick={() => handleSelectStore(s)}
                            className="px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90"
                          >
                            Select Store
                          </button>
                          <Link
                            href="/"
                            className="px-4 py-2 rounded-component border border-aurora-border hover:bg-aurora-surface-hover font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && !error && stores.length === 0 && (
          <p className="text-aurora-muted py-8 text-center">
            No stores found. Add vendors in Aurora Studio.
          </p>
        )}
      </div>
    </div>
  );
}
