import Link from "next/link";
import { StoreContextBar } from "@/components/StoreContextBar";
import { SpecialOffers } from "@/components/SpecialOffers";
import { CategoryNav } from "@/components/CategoryNav";

export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";
const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <StoreContextBar />

      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden min-h-[320px]">
        <div className="absolute inset-0 bg-gradient-to-b from-aurora-surface/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {logoUrl ? (
            <Link href="/" className="mb-6 block drop-shadow-2xl">
              <img
                src={logoUrl}
                alt=""
                className="h-24 sm:h-32 md:h-40 w-auto object-contain max-w-[min(80vw,360px)]"
              />
            </Link>
          ) : (
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-2xl">
              {siteName}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
            Fresh groceries delivered to your door
          </h1>
          <p className="text-aurora-muted text-base sm:text-lg max-w-2xl mx-auto font-medium mb-2 drop-shadow">
            Quality products at affordable prices, delivered when you need them.
          </p>
          <p className="text-aurora-muted/80 text-sm max-w-xl mx-auto mb-8 drop-shadow">
            Browse vegetables, bakery, dairy, snacks & more — all from your favourite local stores.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogue"
              className="inline-block px-8 py-4 rounded-component bg-aurora-accent text-aurora-bg font-bold text-base hover:opacity-90 hover:shadow-lg transition-all"
            >
              Shop Now
            </Link>
            <Link
              href="/promotions"
              className="inline-block px-8 py-4 rounded-component border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all"
            >
              View Promotions
            </Link>
          </div>
        </div>
      </section>

      <CategoryNav />

      <section className="py-12 px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          Special Offers
          <span className="text-aurora-muted text-base font-normal">Store-specific promotions</span>
        </h2>
        <SpecialOffers />
      </section>
    </div>
  );
}
