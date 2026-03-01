"use client";

import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-2xl font-bold mb-8">My Account</h1>
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-3 rounded-component bg-aurora-accent/20 text-aurora-accent font-medium"
          >
            <span>👤</span> Profile
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-component text-aurora-muted hover:text-white hover:bg-aurora-surface"
          >
            <span>📦</span> Orders
          </Link>
          <Link
            href="/account/addresses"
            className="flex items-center gap-3 px-4 py-3 rounded-component text-aurora-muted hover:text-white hover:bg-aurora-surface"
          >
            <span>📍</span> Addresses
          </Link>
          <Link
            href="/account/payment-methods"
            className="flex items-center gap-3 px-4 py-3 rounded-component text-aurora-muted hover:text-white hover:bg-aurora-surface"
          >
            <span>💳</span> Payment Methods
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3 rounded-component text-red-400 hover:bg-aurora-surface w-full text-left"
          >
            <span>🚪</span> Sign Out
          </button>
        </aside>
        <main className="md:col-span-3">
          <div className="p-6 rounded-component bg-aurora-surface border border-aurora-border">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <p className="text-aurora-muted mb-4">
              You&apos;re not signed in. Sign in or create an account to manage your profile, orders, and addresses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/account"
                className="px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
              >
                Sign in
              </Link>
              <Link
                href="/account"
                className="px-4 py-2 rounded-component border border-aurora-border hover:bg-aurora-surface font-medium"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
