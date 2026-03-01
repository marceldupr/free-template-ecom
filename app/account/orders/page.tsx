"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <p className="text-aurora-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <p className="text-aurora-muted mb-6">Sign in to view your order history.</p>
        <Link
          href="/auth/login?returnTo=/account/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <p className="text-aurora-muted">
        Your order history will appear here once you complete a purchase. Orders are stored in your Aurora tenant; you can extend this page to list them via the SDK (e.g. tables or a dedicated orders API).
      </p>
    </div>
  );
}
