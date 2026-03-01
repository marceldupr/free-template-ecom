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
          className="inline-block px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
        >
          View your orders
        </Link>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 rounded-component border border-aurora-border hover:border-aurora-border-hover"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
