import { useMemo } from "react";
import { TrendingUp, ShoppingBag, Receipt, Clock } from "lucide-react";
import { useStore } from "@/lib/store";

export default function WorkerDashboard() {
  const { sales, user } = useStore();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const mine = useMemo(() => sales.filter((s) => s.cashier === user?.name), [sales, user]);
  const todayAll = useMemo(() => sales.filter((s) => s.at >= today.getTime()), [sales]);
  const todayMine = todayAll.filter((s) => s.cashier === user?.name);

  const totalMine = todayMine.reduce((s, x) => s + x.total, 0);
  const itemsMine = todayMine.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);
  const totalAll = todayAll.reduce((s, x) => s + x.total, 0);

  // Hourly chart for today (08:00 - 22:00)
  const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
  const hourBuckets = hours.map((h) => {
    const start = new Date(today); start.setHours(h);
    const end = new Date(today); end.setHours(h + 1);
    const total = todayAll.filter((s) => s.at >= start.getTime() && s.at < end.getTime()).reduce((a, b) => a + b.total, 0);
    return { h, total };
  });
  const maxHour = Math.max(...hourBuckets.map((b) => b.total), 1);

  const recent = [...mine].sort((a, b) => b.at - a.at).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={TrendingUp} label="Mis ventas hoy" value={`S/ ${totalMine.toFixed(2)}`} sub={`${todayMine.length} boletas`} tone="ok" />
        <KPI icon={ShoppingBag} label="Productos vendidos" value={itemsMine} sub="hoy" tone="primary" />
        <KPI icon={Receipt} label="Ventas tienda hoy" value={`S/ ${totalAll.toFixed(2)}`} sub={`${todayAll.length} transacciones`} tone="accent" />
        <KPI icon={Clock} label="Ticket promedio" value={`S/ ${(todayMine.length ? totalMine / todayMine.length : 0).toFixed(2)}`} sub="mi promedio hoy" tone="warn" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-bold mb-5">Ventas por hora — hoy</h3>
          <div className="flex items-end gap-1.5 h-48">
            {hourBuckets.map((b) => {
              const h = (b.total / maxHour) * 100;
              return (
                <div key={b.h} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-secondary/40 rounded-t-md relative h-full overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-accent rounded-t-md transition-all" style={{ height: `${h}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{b.h}h</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-bold mb-4">Mis últimas ventas</h3>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Aún no has registrado ventas</p>
            ) : recent.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">S/ {s.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.items.length} ítems · {new Date(s.at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
