import { defineTool } from "@lovable.dev/mcp-js";
import { statusOf, templateProducts } from "@/lib/inventory-data";

export default defineTool({
  name: "inventory_summary",
  title: "Inventory summary",
  description:
    "Aggregate KPIs of the template inventory: total SKUs, total units, valuation, and counts per stock status and category.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const byStatus = { ok: 0, low: 0, critical: 0, empty: 0 };
    const byCategory: Record<string, { skus: number; units: number; value: number }> = {};
    let totalUnits = 0;
    let valuation = 0;
    for (const p of templateProducts) {
      byStatus[statusOf(p)]++;
      totalUnits += p.stock;
      valuation += p.stock * p.price;
      const c = (byCategory[p.category] ??= { skus: 0, units: 0, value: 0 });
      c.skus++;
      c.units += p.stock;
      c.value += p.stock * p.price;
    }
    const summary = {
      totalSkus: templateProducts.length,
      totalUnits,
      valuation: Number(valuation.toFixed(2)),
      byStatus,
      byCategory,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
