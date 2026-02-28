"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { CheckoutButton } from "@/components/CheckoutButton";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(cents / 100);
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-aurora-muted mb-8">
          Add some products from the catalogue.
        </p>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
        >
          View catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-8">Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-component bg-aurora-surface border border-aurora-border"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-aurora-muted">
                {formatPrice(item.unitAmount)} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-component border border-aurora-border hover:bg-aurora-surface-hover"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-component border border-aurora-border hover:bg-aurora-surface-hover"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-aurora-border flex items-center justify-between">
        <span className="text-lg font-semibold">Total: {formatPrice(total)}</span>
        <CheckoutButton />
      </div>
    </div>
  );
}
