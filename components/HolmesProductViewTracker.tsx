"use client";

import { useEffect } from "react";
import { holmesProductView } from "@/lib/holmes-events";

const STORAGE_KEY = "holmes_products_viewed";
const MAX_VIEWED = 20;

function getViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function appendViewed(productId: string): string[] {
  const current = getViewedIds();
  const filtered = current.filter((id) => id !== productId);
  const next = [productId, ...filtered].slice(0, MAX_VIEWED);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function HolmesProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    if (!productId) return;
    const allIds = appendViewed(productId);
    holmesProductView(allIds);
  }, [productId]);
  return null;
}
