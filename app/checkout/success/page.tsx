"use client";

import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Thank you for your order</h1>
      <p className="text-aurora-muted mb-8">
        Your payment was successful. You will receive a confirmation email
        shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/account/orders"
          className="inline-block px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-accent to-aurora-accent/90 text-aurora-bg font-bold hover:from-aurora-accent/95 hover:to-aurora-accent/80 transition-all duration-200 shadow-lg shadow-aurora-accent/25"
        >
          View your orders
        </Link>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3.5 rounded-xl border border-aurora-border font-medium hover:bg-aurora-surface/50 hover:border-aurora-accent/30 transition-all duration-200"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
