"use client";

import { useEffect } from "react";

/**
 * Dispatches holmes:refreshHome so the Holmes script re-fetches home
 * personalization when the user navigates to the home page.
 * Fixes context loss when clicking Home after browsing.
 */
export function HolmesHomeRefresher() {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("holmes:refreshHome"));
  }, []);
  return null;
}
