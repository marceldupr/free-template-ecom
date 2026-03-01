/**
 * Runs once when the Next.js server starts. Provisions tenant schema on first run (idempotent).
 * Requires AURORA_API_URL and AURORA_API_KEY. Uses aurora/schema.json with base: marketplace-base.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const apiUrl = process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL;
  const apiKey = process.env.AURORA_API_KEY;

  if (!apiUrl || !apiKey) return;

  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const schemaPath = join(process.cwd(), "aurora", "schema.json");
    const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
    const base = apiUrl.replace(/\/$/, "");
    const res = await fetch(`${base}/v1/provision-schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
      body: JSON.stringify({ schema, base: "marketplace-base" }),
    });
    if (res.ok) {
      const data = (await res.json()) as { tablesCreated?: number; message?: string };
      if (data.tablesCreated && data.tablesCreated > 0) {
        console.log("[aurora] Schema provisioned on first run:", data.message);
      }
    }
  } catch {
    // Non-fatal: app may work if schema was provisioned manually
  }
}
