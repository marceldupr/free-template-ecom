import { AuroraClient } from "@aurora-studio/sdk";

const baseUrl = process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.AURORA_API_KEY ?? "";

export function createAuroraClient(): AuroraClient {
  return new AuroraClient({ baseUrl, apiKey });
}

export function getApiBase(): string {
  return baseUrl.replace(/\/$/, "");
}

export function getTenantSlug(): string {
  return process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";
}
