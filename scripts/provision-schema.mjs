#!/usr/bin/env node
/**
 * Provision the e-commerce schema for your Aurora tenant (first run).
 * Uses POST /v1/provision-schema with API key. Base: marketplace-base (vendors, products, vendor_products).
 *
 * Requires: AURORA_API_URL, AURORA_API_KEY (tenant scope). TENANT_SLUG is not required for the API.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const apiUrl = process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL;
const apiKey = process.env.AURORA_API_KEY;

if (!apiUrl || !apiKey) {
  console.error("Usage: AURORA_API_URL=... AURORA_API_KEY=... pnpm schema:provision");
  console.error("Or set NEXT_PUBLIC_AURORA_API_URL and AURORA_API_KEY");
  process.exit(1);
}

const schemaPath = join(__dirname, "../aurora/schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

const base = apiUrl.replace(/\/$/, "");
const url = `${base}/v1/provision-schema`;

console.log(`POST ${url} (base: marketplace-base)`);
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": apiKey,
  },
  body: JSON.stringify({ schema, base: "marketplace-base" }),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`Provision failed: ${res.status} ${res.statusText}`);
  console.error(err);
  process.exit(1);
}

const data = await res.json();
console.log("Schema provisioned:", JSON.stringify(data, null, 2));
