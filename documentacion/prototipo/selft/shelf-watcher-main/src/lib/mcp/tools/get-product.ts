import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { statusOf, statusLabel, templateProducts } from "@/lib/inventory-data";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description: "Fetch a single product from the template catalog by id.",
  inputSchema: {
    id: z.string().min(1).describe("Product id, e.g. 'p01'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const p = templateProducts.find((x) => x.id === id);
    if (!p) {
      return {
        content: [{ type: "text", text: `Product '${id}' not found.` }],
        isError: true,
      };
    }
    const product = {
      ...p,
      status: statusOf(p),
      statusLabel: statusLabel[statusOf(p)],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
