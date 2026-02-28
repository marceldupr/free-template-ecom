import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Nav } from "@/components/Nav";

const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Store";

export const metadata: Metadata = {
  title: siteName,
  description: "Storefront powered by Aurora Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-aurora-bg text-white"
        style={
          {
            "--aurora-accent":
              process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#38bdf8",
          } as React.CSSProperties
        }
      >
        <CartProvider>
          <Nav />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
