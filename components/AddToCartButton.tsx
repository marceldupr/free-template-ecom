"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

interface AddToCartButtonProps {
  recordId: string;
  tableSlug: string;
  name: string;
  unitAmount: number;
  /** Variable-weight product: show weight input, unitAmount = price_per_unit (cents) */
  sellByWeight?: boolean;
  unit?: string;
  /** Product image URL for basket display */
  imageUrl?: string | null;
  className?: string;
}

export function AddToCartButton({
  recordId,
  tableSlug,
  name,
  unitAmount,
  sellByWeight,
  unit = "kg",
  imageUrl,
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [weight, setWeight] = useState<string>("1");

  if (sellByWeight) {
    const handleAdd = () => {
      const w = parseFloat(weight);
      if (!Number.isFinite(w) || w <= 0) return;
      addItem({
        recordId,
        tableSlug,
        name,
        unitAmount,
        quantity: w,
        sellByWeight: true,
        unit,
        imageUrl,
      });
    };
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-20 px-2 py-2 rounded-component border border-aurora-border bg-aurora-bg text-white"
          />
          <span className="text-aurora-muted">{unit}</span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={
            className ??
            "px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90 transition-opacity"
          }
        >
          Add to cart
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem({ recordId, tableSlug, name, unitAmount, imageUrl })}
      className={
        className ??
        "px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90 transition-opacity"
      }
    >
      Add to cart
    </button>
  );
}
