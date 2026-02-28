"use client";

import Link from "next/link";
import { useStore } from "./StoreContext";

export function StoreContextBar() {
  const { store } = useStore();

  if (!store) return null;

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
