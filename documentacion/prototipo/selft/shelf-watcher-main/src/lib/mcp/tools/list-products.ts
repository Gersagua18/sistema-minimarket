import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { statusOf, statusLabel, templateProducts } from "@/lib/inventory-data";

export default defineTool({
  name: "list_products",
  title: "List catalog products",
  description:
    "List products from the minimarket template catalog. Optionally filter by category or stock status (ok, low, critical, empty).",
  inputSchema: {
    category: z.string().optional().describe("Filter by category (e.g. Bebidas, Snacks)."),
    status: z
      .enum(["ok", "low", "critical", "empty"])
      .optional()
      .describe("Filter by computed stock status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, status }) => {
    const items = templateProducts
      .filter((p) => !category || p.category.toLowerCase() === category.toLowerCase())
      .filter((p) => !status || statusOf(p) === status)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        shelf: p.shelf,
        slot: p.slot,
        status: statusOf(p),
        statusLabel: statusLabel[statusOf(p)],
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items, count: items.length },
    };
  },
});
