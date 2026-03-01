"use client";

export default function AddressesPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-2xl font-bold mb-2">Your Addresses</h1>
      <p className="text-aurora-muted mb-6">Manage your delivery addresses</p>
      <div className="flex justify-end mb-6">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
        >
          <span>+</span> Add Address
        </button>
      </div>
      <div className="space-y-4">
        <p className="text-aurora-muted py-8 text-center rounded-component bg-aurora-surface border border-aurora-border">
          You haven&apos;t added any addresses yet.
        </p>
      </div>
    </div>
  );
}
