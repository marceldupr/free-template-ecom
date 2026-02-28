"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthRequiredContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/cart";

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-2xl font-bold mb-6">Sign In Required</h1>
      <div className="p-6 rounded-component bg-aurora-surface border border-aurora-border">
        <h2 className="text-lg font-semibold mb-2">Sign In or Create an Account</h2>
        <p className="text-aurora-muted text-sm mb-6">
          You must be signed in to complete your purchase.
        </p>
        <div className="flex flex-col gap-3 mb-6">
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="w-full py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold text-center hover:opacity-90"
          >
            Sign In
          </Link>
          <Link
            href={`/auth/login?register=1&returnTo=${encodeURIComponent(returnTo)}`}
            className="w-full py-3 rounded-component border border-aurora-border font-medium text-center hover:bg-aurora-surface-hover"
          >
            Create Account
          </Link>
        </div>
        <div className="flex gap-4 text-sm text-aurora-muted">
          <Link href={returnTo} className="hover:text-white">
            ← Back to
          </Link>
          <Link href="/cart" className="text-aurora-accent hover:underline">
            Return to Basket
          </Link>
        </div>
        <p className="text-aurora-muted text-xs mt-4">
          Your items will remain in your basket.
        </p>
      </div>
    </div>
  );
}

export default function AuthRequiredPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16 px-6 text-center text-aurora-muted">Loading…</div>}>
      <AuthRequiredContent />
    </Suspense>
  );
}
