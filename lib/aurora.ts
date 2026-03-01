import {
  AuroraClient,
  type SearchParams,
  type SearchResult,
  type SearchHit,
  type DeliverySlot,
  type StoreItem,
  type CheckoutLineItem,
  type CreateCheckoutSessionParams,
  type CheckoutSessionResult,
  type AcmeSession,
  type HolmesInferResult,
} from "@aurora-studio/sdk";

const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.NEXT_PUBLIC_AURORA_API_KEY ?? process.env.AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/** Optional spec URL so the SDK can adjust from the tenant OpenAPI spec (default: baseUrl + /v1/openapi.json) */
const specUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/v1/openapi.json` : undefined;

export function createAuroraClient(): AuroraClient {
  return new AuroraClient({ baseUrl, apiKey, specUrl });
}

export function getApiBase(): string {
  return baseUrl.replace(/\/$/, "");
}

export function getTenantSlug(): string {
  return tenantSlug;
}

// Re-export types for consumers
export type { SearchParams, SearchResult, SearchHit, DeliverySlot, StoreItem };
export type {
  CheckoutLineItem,
  CreateCheckoutSessionParams,
  CheckoutSessionResult,
  AcmeSession,
  HolmesInferResult,
};

/** Meilisearch-powered product search */
export async function search(params: SearchParams): Promise<SearchResult> {
  const client = createAuroraClient();
  return client.site.search(params);
}

/** Fetch delivery slots for a location */
export async function getDeliverySlots(lat: number, lng: number): Promise<{ data: DeliverySlot[] }> {
  const client = createAuroraClient();
  return client.store.deliverySlots(lat, lng);
}

/** List stores/vendors */
export async function getStores(): Promise<{ data: StoreItem[] }> {
  const client = createAuroraClient();
  return client.site.stores();
}

/** Create checkout session (Stripe or ACME) */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const client = createAuroraClient();
  return client.store.checkout.sessions.create(params);
}

/** Fetch ACME checkout session */
export async function getAcmeSession(sessionId: string): Promise<AcmeSession> {
  const client = createAuroraClient();
  return client.store.checkout.acme.get(sessionId);
}

/** Complete ACME checkout */
export async function completeAcmeCheckout(
  sessionId: string,
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  }
): Promise<{ success: boolean; redirectUrl?: string }> {
  const client = createAuroraClient();
  return client.store.checkout.acme.complete(sessionId, shippingAddress);
}

/** Holmes mission inference */
export async function holmesInfer(sessionId: string): Promise<HolmesInferResult> {
  const client = createAuroraClient();
  return client.holmes.infer(sessionId);
}

/** Current user metadata and related data (e.g. addresses) when userId is provided. Uses GET /me from tenant spec. */
export async function getMe(userId?: string): Promise<{
  tenantId: string;
  user?: { id: string };
  addresses?: unknown[];
  [key: string]: unknown;
}> {
  const client = createAuroraClient();
  return client.me({ userId });
}
