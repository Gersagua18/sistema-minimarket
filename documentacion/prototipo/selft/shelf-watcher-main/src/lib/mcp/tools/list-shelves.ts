import { defineTool } from "@lovable.dev/mcp-js";
import { defaultShelves, statusOf, templateProducts } from "@/lib/inventory-data";

export default defineTool({
  name: "list_shelves",
  title: "List shelves",
  description:
    "List the default shelf layout with the products currently placed in each slot and their stock status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const shelves = defaultShelves.map((sh) => ({
      id: sh.id,
      label: sh.label,
      category: sh.category,
      slots: sh.slots,
      products: templateProducts
        .filter((p) => p.shelf === sh.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slot: p.slot,
          stock: p.stock,
          status: statusOf(p),
        })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(shelves, null, 2) }],
      structuredContent: { shelves },
    };
  },
});
