import { NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey =
  process.env.AURORA_API_KEY ?? process.env.NEXT_PUBLIC_AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy to Aurora site/stores/map - returns stores with lat/lng for map display.
 * Use when main store list doesn't have location (tenant vendors vs public vendors).
 */
export async function GET() {
  try {
    if (!baseUrl || !apiKey || !tenantSlug) {
      return NextResponse.json({ data: [], error: "API not configured" }, { status: 503 });
    }
    const url = `${baseUrl.replace(/\/$/, "")}/api/tenants/${encodeURIComponent(tenantSlug)}/site/stores/map`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ data: [], error: err }, { status: res.status });
    }
    const json = await res.json();
    return NextResponse.json(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load stores map";
    return NextResponse.json({ data: [], error: message }, { status: 500 });
  }
}
