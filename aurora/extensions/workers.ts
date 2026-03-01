/**
 * Ecom template worker extensions: pickwalk learning.
 * Loaded by Aurora workers when free-ecom template is installed.
 */
import { createQueue } from "@aurora-studio/queue";
import pg from "pg";
import { Redis } from "ioredis";
import type { TemplateWorkerExtension, DomainEventPayload } from "@aurora-studio/template-extensions";

interface PickwalkLearnJobData {
  orderId: string;
  tenantId: string;
  vendorRecordId: string;
}

function getSchemaName(tenantId: string): string {
  return `tenant_${tenantId.replace(/-/g, "_")}`;
}

function pgIdentifier(name: string): string {
  return name.includes("-") || /[A-Z]/.test(name) ? `"${name}"` : name;
}

const MAX_DELTA_SECONDS = 300;

async function handleOrderItemPicked(event: DomainEventPayload): Promise<void> {
  const payload = event.payload ?? {};
  const orderId = payload.order_id as string | undefined;
  const tenantId = payload.tenant_id as string | undefined;
  const vendorRecordId = payload.vendor_record_id as string | undefined;

  if (!orderId || !tenantId || !vendorRecordId) {
    console.warn(
      "[free-ecom:order.item.picked] Missing order_id, tenant_id, or vendor_record_id in payload"
    );
    return;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[free-ecom:order.item.picked] REDIS_URL not configured; skipping pickwalk learn");
    return;
  }

  const queue = createQueue<PickwalkLearnJobData>("pickwalk_learn");
  await queue.add("learn", { orderId, tenantId, vendorRecordId });
  console.log("[free-ecom:order.item.picked] Enqueued pickwalk learn for order", orderId);
}

async function processPickwalkLearnJob(job: {
  id: string;
  data: PickwalkLearnJobData;
}): Promise<void> {
  const { orderId, tenantId, vendorRecordId } = job.data as PickwalkLearnJobData;

  const dbUrl = process.env.DB_URL;
  const redisUrl = process.env.REDIS_URL;

  if (!dbUrl || !redisUrl) {
    console.warn("[free-ecom:pickwalk_learn] DB_URL or REDIS_URL not configured");
    return;
  }

  const client = new pg.Client({ connectionString: dbUrl });
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });

  try {
    await client.connect();
    const schemaName = getSchemaName(tenantId);

    const hasZones = (
      await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'zones'`,
        [schemaName.replace(/-/g, "_")]
      )
    ).rows.length > 0;

    const hasZoneId =
      hasZones &&
      (
        await client.query(
          `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'categories' AND column_name = 'zone_id'`,
          [schemaName.replace(/-/g, "_")]
        )
      ).rows.length > 0;

    const hasVendorProducts = (
      await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'vendor_products'`,
        [schemaName.replace(/-/g, "_")]
      )
    ).rows.length > 0;

    const productsHasVendorId = (
      await client.query(
        `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'products' AND column_name = 'vendor_id'`,
        [schemaName.replace(/-/g, "_")]
      )
    ).rows.length > 0;

    if (!hasVendorProducts && !productsHasVendorId) {
      console.warn("[free-ecom:pickwalk_learn] No vendor product linking; skipping");
      return;
    }

    const vendorJoin = hasVendorProducts
      ? `INNER JOIN ${pgIdentifier(schemaName)}.vendor_products vp ON vp.product_id = oi.product_id AND vp.vendor_id = $2 AND vp.tenant_id = $1`
      : "";
    const vendorWhere = hasVendorProducts ? "" : `AND p.vendor_id = $2`;

    const zoneJoin =
      hasZones && hasZoneId
        ? `LEFT JOIN ${pgIdentifier(schemaName)}.categories c ON c.id = p.category_id AND c.tenant_id = p.tenant_id
           LEFT JOIN ${pgIdentifier(schemaName)}.zones z ON z.id = c.zone_id AND z.tenant_id = c.tenant_id`
        : "";
    const zoneSelect =
      hasZones && hasZoneId
        ? "COALESCE(z.slug, 'unassigned') AS zone_slug"
        : "'default' AS zone_slug";

    const query = `
      SELECT oi.id, oi.picked_at, p.id AS product_id, ${zoneSelect}
      FROM ${pgIdentifier(schemaName)}.order_items oi
      INNER JOIN ${pgIdentifier(schemaName)}.products p ON p.id = oi.product_id
      ${vendorJoin}
      ${zoneJoin}
      WHERE oi.order_id = $3 AND oi.tenant_id = $1 AND oi.picked_at IS NOT NULL ${vendorWhere}
      ORDER BY oi.picked_at ASC
    `;

    const result = await client.query(query, [tenantId, vendorRecordId, orderId]);
    const rows = result.rows as Array<{
      id: string;
      picked_at: string;
      product_id: string;
      zone_slug: string;
    }>;

    if (rows.length < 2) return;

    const transitions: Array<{ from: string; to: string; deltaSec: number }> = [];
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      const deltaSec = (new Date(curr.picked_at).getTime() - new Date(prev.picked_at).getTime()) / 1000;
      if (deltaSec > 0 && deltaSec <= MAX_DELTA_SECONDS) {
        transitions.push({
          from: prev.zone_slug,
          to: curr.zone_slug,
          deltaSec,
        });
      }
    }

    if (transitions.length === 0) return;

    const key = `pickwalk:costs:v1:${vendorRecordId}`;
    const existingRaw = await redis.get(key);
    const costs: Record<string, { sum: number; count: number }> = existingRaw
      ? JSON.parse(existingRaw)
      : {};

    for (const { from, to, deltaSec } of transitions) {
      const edge = `${from}->${to}`;
      const prev = costs[edge] ?? { sum: 0, count: 0 };
      costs[edge] = { sum: prev.sum + deltaSec, count: prev.count + 1 };
    }

    await redis.set(key, JSON.stringify(costs), "EX", 60 * 60 * 24 * 90);
    console.log(`[free-ecom:pickwalk_learn] Updated costs for vendor ${vendorRecordId}`);
  } catch (err) {
    console.error("[free-ecom:pickwalk_learn] Failed:", err);
    throw err;
  } finally {
    await client.end();
    redis.quit();
  }
}

const extension: TemplateWorkerExtension = {
  templateId: "free-ecom",
  listeners: [{ event: "order.item.picked", handler: handleOrderItemPicked }],
  processors: [
    {
      queue: "pickwalk_learn",
      name: "learn",
      handler: (job) => processPickwalkLearnJob({ id: job.id, data: job.data as PickwalkLearnJobData }),
    },
  ],
};

export default extension;
