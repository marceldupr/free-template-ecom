import Link from "next/link";
import { CartLink } from "./CartLink";

export function Nav() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

  return (
    <nav className="sticky top-0 z-50 border-b border-aurora-border bg-aurora-bg/95 backdrop-blur supports-[backdrop-filter]:bg-aurora-bg/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
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
        <div className="flex items-center gap-6">
          <Link
            href="/catalogue"
            className="text-sm text-aurora-muted hover:text-white transition-colors"
          >
            Catalogue
          </Link>
          <CartLink />
        </div>
      </div>
    </nav>
  );
}
