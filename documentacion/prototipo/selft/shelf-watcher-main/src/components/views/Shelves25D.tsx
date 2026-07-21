import { useMemo, useState } from "react";
import { Edit3, Save, RotateCcw, Package } from "lucide-react";
import { statusOf, statusLabel, type Product, type StockStatus } from "@/lib/inventory-data";
import { useStore } from "@/lib/store";

const SLOTS_PER_SHELF = 4;

const boxBg: Record<StockStatus, string> = {
  ok: "from-stock-ok to-stock-ok/70",
  low: "from-stock-low to-stock-low/70",
  critical: "from-stock-critical to-stock-critical/70",
  empty: "from-stock-empty to-stock-empty/60",
};
const boxRing: Record<StockStatus, string> = {
  ok: "ring-stock-ok",
  low: "ring-stock-low",
  critical: "ring-stock-critical animate-pulse",
  empty: "ring-stock-empty",
};

export default function Shelves25D({
  editable = false,
  onSelect,
}: {
  editable?: boolean;
  onSelect: (p: Product) => void;
}) {
  const { products, moveProduct } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [tilt, setTilt] = useState({ x: 12, y: -18 });

  const shelves = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const arr = map.get(p.shelf) ?? [];
      arr.push(p);
      map.set(p.shelf, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const onDrop = (e: React.DragEvent, shelf: string, slot: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveProduct(id, shelf, slot);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Inclinación:</span>
          <button onClick={() => setTilt({ x: 6, y: -8 })} className="px-2.5 py-1 rounded-md border border-border text-xs hover:bg-secondary">Suave</button>
          <button onClick={() => setTilt({ x: 12, y: -18 })} className="px-2.5 py-1 rounded-md border border-border text-xs hover:bg-secondary">Normal</button>
          <button onClick={() => setTilt({ x: 18, y: -25 })} className="px-2.5 py-1 rounded-md border border-border text-xs hover:bg-secondary">Pronunciada</button>
          <button onClick={() => setTilt({ x: 0, y: 0 })} className="px-2.5 py-1 rounded-md border border-border text-xs hover:bg-secondary inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Plano
          </button>
        </div>
        {editable && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              editMode ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
            }`}
          >
            {editMode ? <><Save className="w-3.5 h-3.5" /> Terminar acomodo</> : <><Edit3 className="w-3.5 h-3.5" /> Reorganizar anaqueles</>}
          </button>
        )}
      </div>

      {editMode && (
        <div className="text-xs px-4 py-2 rounded-lg bg-accent/20 border border-accent/40 text-foreground">
          Modo edición activo — arrastra una caja a otra casilla para intercambiar productos.
        </div>
      )}

      <div
        className="bg-gradient-to-b from-secondary/40 to-background rounded-3xl border border-border p-10 overflow-hidden"
        style={{ perspective: "1600px" }}
      >
        <div
          className="grid grid-cols-2 gap-12 transition-transform duration-500"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
        >
          {shelves.map(([shelfId, items]) => {
            const slots: (Product | null)[] = Array(SLOTS_PER_SHELF).fill(null);
            items.forEach((p) => { if (p.slot < SLOTS_PER_SHELF) slots[p.slot] = p; });
            return (
              <div key={shelfId} className="space-y-2" style={{ transformStyle: "preserve-3d" }}>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm">Anaquel {shelfId}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{items[0]?.category}</span>
                </div>
                <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                  {/* Back wall */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-shelf/60 to-shelf-edge/60"
                    style={{ transform: "translateZ(-40px)" }}
                  />
                  {/* Shelf plank */}
                  <div className="relative grid grid-cols-4 gap-2 p-3 rounded-xl bg-shelf/40 border border-shelf-edge/40 shadow-2xl">
                    {slots.map((p, idx) => (
                      <Slot
                        key={idx}
                        product={p}
                        shelf={shelfId}
                        slot={idx}
                        editable={editMode}
                        onSelect={onSelect}
                        onDrop={onDrop}
                      />
                    ))}
                  </div>
                  {/* Front lip — gives 2.5D depth */}
                  <div
                    className="absolute -bottom-2 left-0 right-0 h-3 rounded-b-xl bg-gradient-to-b from-shelf-edge to-shelf-edge/40 shadow-lg"
                    style={{ transform: "translateZ(20px) rotateX(-90deg)", transformOrigin: "top" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs px-2">
        {(["ok", "low", "critical", "empty"] as StockStatus[]).map((s) => (
          <div key={s} className="inline-flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded bg-gradient-to-br ${boxBg[s]} ring-1 ${boxRing[s]}`} />
            <span className="text-muted-foreground">{statusLabel[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({ product, shelf, slot, editable, onSelect, onDrop }: {
  product: Product | null;
  shelf: string;
  slot: number;
  editable: boolean;
  onSelect: (p: Product) => void;
  onDrop: (e: React.DragEvent, shelf: string, slot: number) => void;
}) {
  if (!product) {
    return (
      <div
        onDragOver={(e) => editable && e.preventDefault()}
        onDrop={(e) => editable && onDrop(e, shelf, slot)}
        className="aspect-square rounded-lg border-2 border-dashed border-border/60 grid place-items-center text-muted-foreground/40"
      >
        <Package className="w-5 h-5" />
      </div>
    );
  }
  const s = statusOf(product);
  return (
    <button
      draggable={editable}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", product.id)}
      onDragOver={(e) => editable && e.preventDefault()}
      onDrop={(e) => editable && onDrop(e, shelf, slot)}
      onClick={() => !editable && onSelect(product)}
      className={`relative aspect-square rounded-lg bg-gradient-to-br ${boxBg[s]} ring-2 ${boxRing[s]} text-white p-2 flex flex-col justify-between text-left shadow-xl transition-transform hover:-translate-y-1 hover:scale-[1.03] ${editable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      style={{
        boxShadow: "0 8px 0 -2px rgb(0 0 0 / 0.15), 0 14px 18px -6px rgb(0 0 0 / 0.35), inset 0 1px 0 rgb(255 255 255 / 0.4), inset 0 -8px 12px rgb(0 0 0 / 0.15)",
      }}
      title={product.name}
    >
      <span className="text-[9px] uppercase tracking-wide opacity-80 truncate">{product.category.slice(0, 8)}</span>
      <span className="text-[11px] font-bold leading-tight line-clamp-2">{product.name.split(" ").slice(0, 2).join(" ")}</span>
      <div className="flex items-end justify-between">
        <span className="font-display text-lg font-bold leading-none">{product.stock}</span>
        <span className="text-[9px] opacity-80">/{product.minStock}</span>
      </div>
    </button>
  );
}
