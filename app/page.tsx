import Link from "next/link";

export default function HomePage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";

  return (
    <div className="py-14 sm:py-24 px-4 sm:px-6 text-center bg-gradient-to-b from-aurora-surface/30 to-transparent">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-sm">
        Welcome to {siteName}
      </h1>
      <p className="text-aurora-muted text-base sm:text-lg max-w-2xl mx-auto font-medium mb-8">
        Browse our collection and find something you love.
      </p>
      <Link
        href="/catalogue"
        className="inline-block px-8 py-4 rounded-component bg-aurora-accent text-aurora-bg font-bold text-base hover:opacity-90 hover:shadow-lg transition-all"
      >
        Shop now
      </Link>
    </div>
  );
}
