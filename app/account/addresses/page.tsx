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
        <div className="p-4 rounded-component bg-aurora-surface border-2 border-aurora-accent/50">
          <p className="font-medium">Default Address</p>
          <p className="text-aurora-muted text-sm">Cycleway Six, Southwark, London, SE1</p>
          <button type="button" className="text-aurora-muted hover:text-white text-sm mt-2">
            ✏️ Edit
          </button>
        </div>
        <div className="p-4 rounded-component bg-aurora-surface border border-aurora-border">
          <p className="font-medium">12A Mepham Street, Lambeth, London, SE1 8SQ</p>
          <div className="flex gap-2 mt-2">
            <button type="button" className="text-aurora-muted hover:text-white text-sm">
              ✏️ Edit
            </button>
            <button type="button" className="text-aurora-muted hover:text-white text-sm">
              ⭐ Set default
            </button>
            <button type="button" className="text-red-400 hover:text-red-300 text-sm">
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
