import { useMemo, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Search } from "lucide-react";
import { statusOf, type Product, type StockStatus } from "@/lib/inventory-data";
import { useStore } from "@/lib/store";

const statusDot: Record<StockStatus, string> = {
  ok: "bg-stock-ok", low: "bg-stock-low", critical: "bg-stock-critical", empty: "bg-stock-empty border border-border",
};

export default function SalesView() {
  const { products, registerSale } = useStore();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  const addToCart = (p: Product) => {
    if (p.stock <= 0) return;
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex) return c.map((i) => i.product.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...c, { product: p, qty: 1 }];
    });
  };
  const updateQty = (id: string, d: number) =>
    setCart((c) => c.map((i) => i.product.id === id ? { ...i, qty: Math.max(0, Math.min(i.qty + d, i.product.stock)) } : i).filter((i) => i.qty > 0));

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const confirm = () => {
    if (!cart.length) return;
    registerSale(cart.map((i) => ({ productId: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty })));
    setCart([]);
    setToast(`Boleta generada — S/ ${total.toFixed(2)}`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="grid grid-cols-3 gap-6 relative">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-stock-ok text-white px-4 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-right">
          ✓ {toast}
        </div>
      )}

      <div className="col-span-2 bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-display font-bold">Catálogo</h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-2">
          {filtered.map((p) => {
            const s = statusOf(p);
            const disabled = p.stock <= 0;
            return (
              <button key={p.id} disabled={disabled} onClick={() => addToCart(p)}
                className="text-left p-4 rounded-xl border border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-background active:scale-[0.98]">
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusDot[s]}`} />
                  <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">{p.shelf}</span>
                </div>
                <p className="font-medium text-sm leading-tight mb-2 line-clamp-2">{p.name}</p>
                <div className="flex items-end justify-between">
                  <span className="font-display text-lg font-bold text-primary">S/ {p.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">Stk {p.stock}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 flex flex-col h-fit sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">Boleta actual</h3>
          <span className="ml-auto text-xs text-muted-foreground">{cart.length} ítems</span>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Selecciona productos del catálogo</div>
        ) : (
          <>
            <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
              {cart.map((i) => (
                <div key={i.product.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">S/ {i.product.price.toFixed(2)} × {i.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(i.product.id, -1)} className="w-6 h-6 rounded bg-background grid place-items-center hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => updateQty(i.product.id, 1)} className="w-6 h-6 rounded bg-background grid place-items-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => updateQty(i.product.id, -i.qty)} className="ml-1 w-6 h-6 rounded grid place-items-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm border-t border-border pt-3 mb-4">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground font-medium">S/ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>IGV (18%)</span><span className="text-foreground font-medium">S/ {igv.toFixed(2)}</span></div>
              <div className="flex justify-between font-display text-xl font-bold pt-2">
                <span>Total</span><span className="text-primary">S/ {total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={confirm} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors active:scale-[0.98]">
              Generar boleta
            </button>
          </>
        )}
      </div>
    </div>
  );
}
