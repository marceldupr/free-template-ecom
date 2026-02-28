#!/usr/bin/env node
/**
 * Provision the e-commerce schema for your Aurora tenant.
 *
 * Requires: AURORA_API_URL, AURORA_API_KEY, TENANT_SLUG in env.
 * The schema/import API requires tenant admin auth. If using an API key,
 * it may return 401/403 — in that case, import manually in Aurora Studio:
 * Data Builder → Import from JSON → use schema/base-store-schema-import.json
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const apiUrl = process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL;
const apiKey = process.env.AURORA_API_KEY;
const tenantSlug = process.env.TENANT_SLUG || process.env.NEXT_PUBLIC_TENANT_SLUG;

if (!apiUrl || !apiKey || !tenantSlug) {
  console.error("Usage: AURORA_API_URL=... AURORA_API_KEY=... TENANT_SLUG=... pnpm schema:provision");
  console.error("Or set NEXT_PUBLIC_AURORA_API_URL, AURORA_API_KEY, NEXT_PUBLIC_TENANT_SLUG");
  process.exit(1);
}

const schemaPath = join(__dirname, "../schema/base-store-schema-import.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

const base = apiUrl.replace(/\/$/, "");
const url = `${base}/api/tenants/${tenantSlug}/schema/import`;

console.log(`POST ${url}`);
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
  },
  body: JSON.stringify(schema),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`Schema import failed: ${res.status} ${res.statusText}`);
  console.error(err);
  if (res.status === 401 || res.status === 403) {
    console.error("\nThe schema/import API requires tenant admin auth.");
    console.error("Import manually: Aurora Studio → Data Builder → Import from JSON");
    console.error(`Use the file: apps/free-templates/ecom/schema/base-store-schema-import.json`);
  }
  process.exit(1);
}

const data = await res.json();
console.log("Schema imported successfully:", JSON.stringify(data, null, 2));
