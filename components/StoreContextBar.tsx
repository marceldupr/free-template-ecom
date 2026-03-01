"use client";

import Link from "next/link";
import { useStore } from "./StoreContext";

export function StoreContextBar() {
  const { store } = useStore();

  if (store) {
    return (
      <div className="border-b border-aurora-border bg-aurora-surface/50 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-aurora-muted">
            <span>🏪</span>
            <span>Shopping from: {store.name}</span>
            <Link
              href="/stores"
              className="text-aurora-accent hover:underline ml-1"
            >
              View Store Details
            </Link>
          </div>
          <Link
            href="/stores"
            className="text-sm font-medium text-aurora-accent hover:underline"
          >
            Change Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-aurora-border bg-aurora-accent/15 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white font-medium">
          Select a store to search products and see availability.
        </p>
        <Link
          href="/location"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium text-sm hover:opacity-90"
        >
          <span>📍</span> Set location & choose store
        </Link>
      </div>
    </div>
  );
}
