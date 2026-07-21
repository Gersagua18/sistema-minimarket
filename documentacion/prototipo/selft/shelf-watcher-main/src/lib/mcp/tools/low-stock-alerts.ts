import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { statusOf, templateProducts } from "@/lib/inventory-data";

export default defineTool({
  name: "low_stock_alerts",
  title: "Low stock alerts",
  description:
    "Return products that need restocking: those with status 'empty', 'critical', or 'low'.",
  inputSchema: {
    includeLow: z
      .boolean()
      .optional()
      .describe("Include products with 'low' status (default true)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ includeLow = true }) => {
    const alerts = templateProducts
      .map((p) => ({ p, s: statusOf(p) }))
      .filter(({ s }) => s === "empty" || s === "critical" || (includeLow && s === "low"))
      .map(({ p, s }) => ({
        id: p.id,
        name: p.name,
        shelf: p.shelf,
        slot: p.slot,
        stock: p.stock,
        minStock: p.minStock,
        status: s,
        suggestedRestock: Math.max(0, p.minStock * 2 - p.stock),
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(alerts, null, 2) }],
      structuredContent: { alerts, count: alerts.length },
    };
  },
});
