"use client";

import Link from "next/link";
import { CartLink } from "./CartLink";
import { SearchDropdown } from "./SearchDropdown";
import { useStore } from "./StoreContext";

export function Nav() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const { location, store } = useStore();

  const locationDisplay = location?.address ?? store?.name ?? "Select location";

  return (
    <nav className="sticky top-0 z-50 border-b border-aurora-border bg-aurora-bg/95 backdrop-blur supports-[backdrop-filter]:bg-aurora-bg/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-14">
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-semibold">{siteName}</span>
              )}
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-aurora-muted hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/promotions"
                className="text-sm text-aurora-muted hover:text-white transition-colors"
              >
                Promotions
              </Link>
              <Link
                href="/about"
                className="text-sm text-aurora-muted hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            {store ? (
              <SearchDropdown
                placeholder={`Search products in ${store.name}…`}
                vendorId={store.id}
              />
            ) : (
              <Link href="/stores" className="block cursor-pointer">
                <span className="pointer-events-none block">
                  <SearchDropdown
                    placeholder="Select a store to search products…"
                    vendorId={undefined}
                  />
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={store ? "/stores" : "/location"}
              className="flex items-center gap-2 text-sm text-aurora-muted hover:text-white transition-colors min-w-0 max-w-[140px]"
              title={locationDisplay}
            >
              <span>📍</span>
              <span className="truncate">{locationDisplay}</span>
            </Link>
            <CartLink />
            <Link
              href="/account"
              className="text-aurora-muted hover:text-white p-2 rounded-component hover:bg-aurora-surface"
              aria-label="Account"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
