"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 text-sm text-aurora-muted hover:text-white transition-colors"
    >
      <span>Cart</span>
      {count > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-aurora-accent text-aurora-bg text-xs font-medium">
          {count}
        </span>
      )}
    </Link>
  );
}
