import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { statusOf, statusLabel } from "@/lib/inventory-data";

export default function ReportsView() {
  const { products } = useStore();

  const alerts = useMemo(() => products.filter((p) => ["low", "critical", "empty"].includes(statusOf(p))), [products]);
  const totals = useMemo(() => ({
    sku: products.length,
    units: products.reduce((s, p) => s + p.stock, 0),
    lowCount: alerts.length,
    value: products.reduce((s, p) => s + p.stock * p.price, 0),
  }), [products, alerts]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { count: number; units: number; value: number }>();
    for (const p of products) {
      const e = map.get(p.category) ?? { count: 0, units: 0, value: 0 };
      e.count += 1; e.units += p.stock; e.value += p.stock * p.price;
      map.set(p.category, e);
    }
    return Array.from(map.entries());
  }, [products]);
  const maxUnits = Math.max(...byCategory.map(([, v]) => v.units), 1);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-card rounded-2xl border border-border p-6">
        <h3 className="font-display text-lg font-bold mb-5">Inventario por categoría</h3>
        <div className="space-y-4">
          {byCategory.map(([cat, v]) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{cat}</span>
                <span className="text-muted-foreground">{v.units} und · S/ {v.value.toFixed(2)}</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${(v.units / maxUnits) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-stock-critical" />
          <h3 className="font-display text-lg font-bold">Alertas activas</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin alertas</p>
          ) : alerts.map((p) => {
            const s = statusOf(p);
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <span className={`w-2.5 h-2.5 rounded-full ${s === "critical" || s === "empty" ? "bg-stock-critical" : "bg-stock-low"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Anaquel {p.shelf} · {statusLabel[s]}</p>
                </div>
                <span className="font-display font-bold text-stock-critical">{p.stock}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="col-span-3 bg-card rounded-2xl border border-border p-6">
        <h3 className="font-display text-lg font-bold mb-4">Resumen ejecutivo</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <Stat label="SKUs activos" value={totals.sku} />
          <Stat label="Unidades en piso" value={totals.units} />
          <Stat label="Productos con alerta" value={`${totals.lowCount} de ${totals.sku}`} />
          <Stat label="Valor total" value={`S/ ${totals.value.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-4 rounded-xl bg-secondary/50">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-display text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
