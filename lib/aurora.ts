import { AuroraClient } from "@aurora-studio/sdk";

const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.NEXT_PUBLIC_AURORA_API_KEY ?? process.env.AURORA_API_KEY ?? "";

export function createAuroraClient(): AuroraClient {
  return new AuroraClient({ baseUrl, apiKey });
}

export function getApiBase(): string {
  return baseUrl.replace(/\/$/, "");
}

export function getTenantSlug(): string {
  return process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";
}

// --- Fetch wrappers for APIs not yet in aurora-sdk ---

const api = () => {
  const base = getApiBase();
  const tenant = getTenantSlug();
  if (!base || !tenant) throw new Error("Aurora API not configured");
  return { base, tenant };
};

export interface SearchParams {
  q?: string;
  limit?: number;
  offset?: number;
  vendorId?: string;
  category?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface SearchHit {
  id: string;
  docType?: string;
  tableSlug: string;
  recordId: string;
  snippet?: string;
  name?: string;
  title?: string;
  price?: number;
  image_url?: string;
  vendor_id?: string;
  [key: string]: unknown;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  facetDistribution: Record<string, unknown>;
  provider: "meilisearch" | "fallback";
}

/** Meilisearch-powered product search. Use GET /api/tenants/:tenant/site/search */
export async function search(params: SearchParams): Promise<SearchResult> {
  const { base, tenant } = api();
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));
  if (params.vendorId) sp.set("vendor_id", params.vendorId);
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  if (params.order) sp.set("order", params.order);
  const res = await fetch(`${base}/api/tenants/${tenant}/site/search?${sp}`, {
    headers: apiKey ? { "X-Api-Key": apiKey } : undefined,
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export interface DeliverySlot {
  id: string;
  vendor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_orders: number;
  orders_count: number;
}

/** Fetch delivery slots for a location. Use GET /api/tenants/:tenant/store/delivery-slots */
export async function getDeliverySlots(lat: number, lng: number): Promise<{ data: DeliverySlot[] }> {
  const { base, tenant } = api();
  const res = await fetch(
    `${base}/api/tenants/${tenant}/store/delivery-slots?lat=${lat}&lng=${lng}`,
    { headers: apiKey ? { "X-Api-Key": apiKey } : undefined }
  );
  if (!res.ok) throw new Error("Failed to fetch delivery slots");
  return res.json();
}

export interface StoreItem {
  id: string;
  email?: string;
  name: string;
  location?: unknown;
  address?: string;
  image_url?: string;
}

/** List stores/vendors. Use GET /api/tenants/:tenant/site/stores */
export async function getStores(): Promise<{ data: StoreItem[] }> {
  const { base, tenant } = api();
  const res = await fetch(`${base}/api/tenants/${tenant}/site/stores`, {
    headers: apiKey ? { "X-Api-Key": apiKey } : undefined,
  });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}

export interface CheckoutLineItem {
  productId?: string;
  tableSlug?: string;
  quantity?: number;
  priceData: {
    unitAmount: number;
    currency?: string;
    productData?: { name?: string };
  };
}

export interface CreateCheckoutSessionParams {
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  currency?: string;
  deliverySlotId?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  id: string;
  url: string;
}

/** Create checkout session. Use POST /api/tenants/:tenant/store/checkout/sessions */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { base, tenant } = api();
  const res = await fetch(`${base}/api/tenants/${tenant}/store/checkout/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
    },
    body: JSON.stringify({
      lineItems: params.lineItems,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      currency: params.currency,
      deliverySlotId: params.deliverySlotId,
      metadata: params.metadata,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Checkout failed");
  }
  return res.json();
}

export interface AcmeSession {
  session_id: string;
  line_items: Array<{
    name?: string;
    quantity?: number;
    unitAmount?: number;
  }>;
  total: number;
  currency: string;
  success_url: string;
  cancel_url: string;
  requireShipping?: boolean;
}

/** Fetch ACME checkout session. GET /api/tenants/:tenant/store/checkout/acme */
export async function getAcmeSession(sessionId: string): Promise<AcmeSession> {
  const { base, tenant } = api();
  const res = await fetch(
    `${base}/api/tenants/${tenant}/store/checkout/acme?session=${encodeURIComponent(sessionId)}`,
    { headers: apiKey ? { "X-Api-Key": apiKey } : undefined }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Session not found");
  }
  return res.json();
}

/** Complete ACME checkout. POST /api/tenants/:tenant/store/checkout/acme/complete */
export async function completeAcmeCheckout(
  sessionId: string,
  shippingAddress?: { line1?: string; line2?: string; city?: string; postal_code?: string; country?: string }
): Promise<{ success: boolean; redirectUrl?: string }> {
  const { base, tenant } = api();
  const res = await fetch(`${base}/api/tenants/${tenant}/store/checkout/acme/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
    },
    body: JSON.stringify({ sessionId, shippingAddress }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean; redirectUrl?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Payment failed");
  return { success: data.success ?? true, redirectUrl: data.redirectUrl };
}

export interface HolmesInferResult {
  mission?: { summary: string; confidence: number };
  bundle?: {
    headline: string;
    subheadline?: string;
    productIds: string[];
    productTableSlug?: string;
    products?: Array<{ id: string; name: string; price?: number; image?: string }>;
    reasoning?: string;
  };
}

/** Holmes mission inference. Use GET /api/tenants/:tenant/holmes/infer */
export async function holmesInfer(sessionId: string): Promise<HolmesInferResult> {
  const { base, tenant } = api();
  const res = await fetch(
    `${base}/api/tenants/${tenant}/holmes/infer?sid=${encodeURIComponent(sessionId)}`,
    { headers: apiKey ? { "X-Api-Key": apiKey } : undefined }
  );
  if (!res.ok) return {};
  return res.json();
}
