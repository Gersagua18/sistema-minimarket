import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import lowStockAlerts from "./tools/low-stock-alerts";
import inventorySummary from "./tools/inventory-summary";
import listShelves from "./tools/list-shelves";

export default defineMcp({
  name: "minimarket-central-mcp",
  title: "MiniMarket Central MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the MiniMarket Central template catalog: browse products, inspect shelves, get low-stock alerts, and compute inventory KPIs.",
  tools: [listProducts, getProduct, lowStockAlerts, inventorySummary, listShelves],
});
