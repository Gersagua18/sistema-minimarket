import { useState } from "react";
import { Search, Plus, Minus } from "lucide-react";
import { statusOf, statusLabel, type StockStatus } from "@/lib/inventory-data";
import { useStore } from "@/lib/store";

const statusBg: Record<StockStatus, string> = {
  ok: "bg-stock-ok-soft text-stock-ok",
  low: "bg-stock-low-soft text-foreground",
  critical: "bg-stock-critical-soft text-stock-critical",
  empty: "bg-secondary text-muted-foreground",
};

export default function ProductsView({ canEdit = false }: { canEdit?: boolean }) {
  const { products, restock } = useStore();
  const [search, setSearch] = useState("");
  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Anaquel</th>
              <th className="px-5 py-3 text-right">Stock</th>
              <th className="px-5 py-3 text-right">Mínimo</th>
              <th className="px-5 py-3 text-right">Precio</th>
              <th className="px-5 py-3">Estado</th>
              {canEdit && <th className="px-5 py-3 text-center">Reponer</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const s = statusOf(p);
              return (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-md bg-secondary text-xs font-mono">{p.shelf}</span></td>
                  <td className="px-5 py-3 text-right font-display font-bold">{p.stock}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{p.minStock}</td>
                  <td className="px-5 py-3 text-right font-medium">S/ {p.price.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBg[s]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusLabel[s]}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => restock(p.id, -1)} className="w-7 h-7 rounded-md border border-border grid place-items-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <button onClick={() => restock(p.id, 1)} className="w-7 h-7 rounded-md border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => restock(p.id, 10)} className="ml-1 px-2 h-7 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                          +10
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
