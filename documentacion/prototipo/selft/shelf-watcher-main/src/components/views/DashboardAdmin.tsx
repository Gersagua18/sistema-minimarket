import { useMemo } from "react";
import { TrendingUp, ShoppingBag, AlertTriangle, Package, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";
import { statusOf, statusLabel } from "@/lib/inventory-data";

export default function DashboardAdmin() {
  const { sales, products } = useStore();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;

  const last7 = useMemo(() => {
    const buckets: { label: string; total: number; count: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const start = today.getTime() - d * dayMs;
      const end = start + dayMs;
      const ds = sales.filter((s) => s.at >= start && s.at < end);
      buckets.push({
        label: new Date(start).toLocaleDateString("es-PE", { weekday: "short" }),
        total: ds.reduce((s, x) => s + x.total, 0),
        count: ds.length,
      });
    }
    return buckets;
  }, [sales]);

  const todaySales = last7[last7.length - 1];
  const weekTotal = last7.reduce((s, b) => s + b.total, 0);
  const weekCount = last7.reduce((s, b) => s + b.count, 0);
  const avgTicket = weekCount ? weekTotal / weekCount : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach((s) => s.items.forEach((it) => {
      const e = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 };
      e.qty += it.qty;
      e.revenue += it.qty * it.price;
      map.set(it.productId, e);
    }));
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [sales]);

  const alerts = useMemo(
    () => products.filter((p) => ["low", "critical", "empty"].includes(statusOf(p))),
    [products],
  );

  const maxBar = Math.max(...last7.map((b) => b.total), 1);
  const maxTopQty = Math.max(...topProducts.map((p) => p.qty), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={TrendingUp} label="Ventas hoy" value={`S/ ${todaySales.total.toFixed(2)}`} sub={`${todaySales.count} transacciones`} tone="ok" />
        <KPI icon={ShoppingBag} label="Ventas 7 días" value={`S/ ${weekTotal.toFixed(2)}`} sub={`${weekCount} boletas`} tone="primary" />
        <KPI icon={Package} label="Ticket promedio" value={`S/ ${avgTicket.toFixed(2)}`} sub="últimos 7 días" tone="accent" />
        <KPI icon={AlertTriangle} label="Alertas activas" value={alerts.length} sub="productos por reponer" tone="warn" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-bold">Ventas últimos 7 días</h3>
            <span className="text-xs text-muted-foreground">Total: S/ {weekTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-end justify-between gap-3 h-56">
            {last7.map((b, i) => {
              const h = (b.total / maxBar) * 100;
              const isToday = i === last7.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    S/ {b.total.toFixed(0)}
                  </span>
                  <div className="w-full bg-secondary/40 rounded-t-xl relative overflow-hidden" style={{ height: "100%" }}>
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-t-xl transition-all ${
                        isToday ? "bg-gradient-to-t from-primary to-accent" : "bg-gradient-to-t from-primary/70 to-primary/40"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? "font-bold text-primary" : "text-muted-foreground"} capitalize`}>{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-stock-critical" />
            <h3 className="font-display text-lg font-bold">Alertas de stock</h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Todo en orden</p>
            ) : (
              alerts.slice(0, 8).map((p) => {
                const s = statusOf(p);
                return (
                  <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40">
                    <div className={`w-2 h-2 rounded-full ${s === "critical" || s === "empty" ? "bg-stock-critical animate-pulse" : "bg-stock-low"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{statusLabel[s]} · Anaquel {p.shelf}</p>
                    </div>
                    <span className="font-display font-bold text-sm">{p.stock}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold">Productos más vendidos</h3>
          <span className="text-xs text-muted-foreground ml-2">últimos 7 días</span>
        </div>
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center font-display font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate">{p.name}</span>
                  <span className="text-muted-foreground">{p.qty} und · S/ {p.revenue.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${(p.qty / maxTopQty) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, tone }: { icon: any; label: string; value: any; sub: string; tone: "primary" | "ok" | "warn" | "accent" }) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    ok: "bg-stock-ok-soft text-stock-ok",
    warn: "bg-stock-critical-soft text-stock-critical",
    accent: "bg-stock-low-soft text-foreground",
  };
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-display text-2xl font-bold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
