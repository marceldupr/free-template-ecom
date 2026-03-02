"use client";

import { useEffect } from "react";
import { holmesProductView } from "@/lib/holmes-events";

export function HolmesProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    if (productId) holmesProductView([productId]);
  }, [productId]);
  return null;
}
