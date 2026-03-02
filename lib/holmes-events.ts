/**
 * Holmes event bridge — push storefront signals to the Holmes script.
 * Works for any storefront: call directly or dispatch DOM events.
 * The Holmes script (loaded via layout) listens and sends data to Aurora.
 *
 * Integration: paste <script src=".../holmes/v1/script.js?site=X"></script>
 * then call these helpers or dispatch the equivalent CustomEvents.
 */

declare global {
  interface Window {
    holmes?: {
      setSearch: (q: string | string[]) => void;
      setProductsViewed: (ids: string[]) => void;
      setCartCount: (n: number) => void;
      setCartItems: (items: Array<{ id: string; name: string; price: number }>) => void;
    };
  }
}

export function holmesSearch(query: string): void {
  if (typeof window === "undefined") return;
  const q = String(query || "").trim();
  if (!q) return;
  if (window.holmes) window.holmes.setSearch(q);
  document.dispatchEvent(new CustomEvent("holmes:search", { detail: { q } }));
}

export function holmesProductView(productIds: string[]): void {
  if (typeof window === "undefined") return;
  const ids = Array.isArray(productIds) ? productIds : [];
  if (ids.length === 0) return;
  if (window.holmes) window.holmes.setProductsViewed(ids);
  document.dispatchEvent(new CustomEvent("holmes:productView", { detail: { productIds: ids } }));
}

export function holmesCartUpdate(
  count: number,
  items?: Array<{ id: string; name: string; price: number }>
): void {
  if (typeof window === "undefined") return;
  if (window.holmes) {
    window.holmes.setCartCount(count);
    if (items) window.holmes.setCartItems(items);
  }
  document.dispatchEvent(
    new CustomEvent("holmes:cartUpdate", { detail: { count, items: items ?? [] } })
  );
}
