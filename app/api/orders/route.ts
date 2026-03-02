import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy to Aurora site/dashboard/orders. Requires Bearer token from client.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!baseUrl || !apiKey || !tenantSlug) {
    return NextResponse.json(
      { error: "Orders API not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/tenants/${encodeURIComponent(tenantSlug)}/site/dashboard/orders`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      return NextResponse.json(
        { error: err.error ?? "Failed to load orders" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
