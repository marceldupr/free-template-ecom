"use client";

import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  recordId: string;
  tableSlug: string;
  name: string;
  unitAmount: number;
  className?: string;
}

export function AddToCartButton({
  recordId,
  tableSlug,
  name,
  unitAmount,
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem({ recordId, tableSlug, name, unitAmount })}
      className={
        className ??
        "px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90 transition-opacity"
      }
    >
      Add to cart
    </button>
  );
}
