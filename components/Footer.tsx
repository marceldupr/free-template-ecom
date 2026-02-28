import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";

export function Footer() {
  return (
    <footer className="border-t border-aurora-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="text-lg font-semibold mb-2">{siteName}</p>
            <p className="text-aurora-muted text-sm">
              Your neighborhood online grocery store. Fresh produce, quality products, and convenient delivery.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-aurora-muted">
              <li><Link href="/catalogue" className="hover:text-white">Fresh Produce</Link></li>
              <li><Link href="/catalogue" className="hover:text-white">Bakery</Link></li>
              <li><Link href="/catalogue" className="hover:text-white">Dairy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-aurora-muted">
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">Orders</Link></li>
              <li><Link href="/account/addresses" className="hover:text-white">Addresses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-aurora-muted">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/about" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
