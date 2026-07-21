import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search, MapPin, Tag, ShoppingBasket, Store as StoreIcon,
  ArrowLeft, Filter, ShieldCheck, ArrowRight, Sparkles, X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { statusOf, statusLabel } from "@/lib/inventory-data";
import Shelves25D from "./Shelves25D";

export default function ClientPortal() {
  const { stores, currentStoreId, selectStore, exitStore } = useStore();
  const store = stores.find((s) => s.id === currentStoreId) ?? null;
  if (!store) return <StoreDiscover stores={stores} onPick={selectStore} />;
  return <Catalog storeName={store.name} storeAddress={`${store.address}, ${store.city}`} onExit={exitStore} />;
}

// ============ Store discovery (public) ============
function StoreDiscover({ stores, onPick }: { stores: any[]; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = stores.filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.city.toLowerCase().includes(q.toLowerCase()) ||
    s.address.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="max-w-5xl mx-auto px-6 pb-16">
        <section className="text-center max-w-2xl mx-auto pt-6 pb-10">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-accent bg-accent-soft px-3 py-1 rounded mb-4">
            <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" /> Portal cliente
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Encuentra productos <br className="hidden sm:block" />
            <span className="text-accent">antes de entrar</span> a la tienda.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Elige un minimarket y consulta su catálogo, precios y el anaquel exacto de cada producto.
          </p>
        </section>

        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar minimarket por nombre o ciudad…"
            className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm shadow-sm" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const cover = ["oklch(0.94 0.04 45)", "oklch(0.93 0.04 232)", "oklch(0.93 0.05 155)"][
              Math.abs(hash(s.id)) % 3
            ];
            return (
              <button key={s.id} onClick={() => onPick(s.id)}
                className="group text-left bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:-translate-y-0.5 transition-all shadow-sm">
                <div className="h-24 relative" style={{ background: cover }}>
                  <StoreIcon className="w-10 h-10 text-foreground/40 absolute right-4 bottom-3" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg leading-tight">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {s.address}, {s.city}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{s.products.length} productos</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:gap-2 transition-all">
                      Ver catálogo <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
              No hay minimarkets que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ============ Store catalog ============
function Catalog({ storeName, storeAddress, onExit }: { storeName: string; storeAddress: string; onExit: () => void }) {
  const { store } = useStore();
  const [tab, setTab] = useState<"catalogo" | "mapa">("catalogo");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [detail, setDetail] = useState<any | null>(null);

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set((store?.products ?? []).map((p) => p.category)))],
    [store?.products],
  );
  const filtered = (store?.products ?? []).filter((p) =>
    (cat === "Todas" || p.category === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onExit} title="Otra tienda"
              className="w-9 h-9 grid place-items-center rounded hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded bg-accent-soft text-accent grid place-items-center">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold leading-tight truncate">{storeName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {storeAddress}
              </p>
            </div>
          </div>
          <StaffLink />
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          <TabBtn active={tab === "catalogo"} onClick={() => setTab("catalogo")}>Catálogo</TabBtn>
          <TabBtn active={tab === "mapa"} onClick={() => setTab("mapa")}>Mapa de anaqueles</TabBtn>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "catalogo" && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="¿Qué producto buscas?"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm shadow-sm" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                {categories.map((c) => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      cat === c ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/70"
                    }`}>{c}</button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{filtered.length} productos disponibles</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const s = statusOf(p);
                const dotColor: Record<string, string> = {
                  ok: "bg-stock-ok", low: "bg-stock-low", critical: "bg-stock-critical", empty: "bg-stock-empty",
                };
                const bgTint: Record<string, string> = {
                  ok: "from-stock-ok-soft", low: "from-stock-low-soft",
                  critical: "from-stock-critical-soft", empty: "from-secondary",
                };
                return (
                  <button key={p.id} onClick={() => setDetail(p)}
                    className="text-left bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:-translate-y-0.5 transition-all shadow-sm">
                    <div className={`h-24 bg-gradient-to-br ${bgTint[s]} to-transparent grid place-items-center`}>
                      <ShoppingBasket className="w-10 h-10 text-foreground/25" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wide font-semibold bg-secondary px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${dotColor[s]}`} title={statusLabel[s]} />
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                      <div className="flex items-end justify-between">
                        <span className="font-display text-xl font-bold text-primary inline-flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> S/ {p.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">{p.shelf}·{p.slot + 1}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
                  No encontramos productos que coincidan con tu búsqueda
                </div>
              )}
            </div>
          </>
        )}

        {tab === "mapa" && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <h3 className="font-display text-lg font-bold">Mapa de anaqueles</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza la distribución de la tienda. Toca una caja para ver detalle.
              </p>
            </div>
            <Shelves25D onSelect={setDetail} />
          </div>
        )}
      </main>

      {detail && <ProductSheet product={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function StaffLink() {
  return (
    <Link to="/panel"
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded border border-border hover:border-primary hover:text-primary text-xs font-semibold transition-colors">
      <ShieldCheck className="w-3.5 h-3.5" /> Acceso staff
    </Link>
  );
}

function TopBar() {
  return (
    <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded bg-primary text-primary-foreground grid place-items-center">
          <StoreIcon className="w-5 h-5" />
        </div>
        <span className="font-display text-lg font-bold">MiniStock</span>
      </Link>
      <Link to="/panel"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-border hover:border-primary hover:text-primary text-xs font-semibold transition-colors">
        <ShieldCheck className="w-3.5 h-3.5" /> Acceso staff
      </Link>
    </header>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
        active ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}>{children}</button>
  );
}

function ProductSheet({ product, onClose }: { product: any; onClose: () => void }) {
  const s = statusOf(product);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded hover:bg-secondary grid place-items-center">
          <X className="w-4 h-4" />
        </button>
        <div className="w-full aspect-video rounded-md bg-gradient-to-br from-accent-soft to-primary-soft grid place-items-center mb-5">
          <ShoppingBasket className="w-16 h-16 text-foreground/40" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.category}</span>
        <h3 className="font-display text-2xl font-bold mt-1 mb-4">{product.name}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-md bg-secondary/60">
            <p className="text-xs text-muted-foreground mb-1">Precio</p>
            <p className="font-display font-bold text-lg text-primary">S/ {product.price.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-md bg-secondary/60">
            <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
            <p className="font-display font-bold">Anaquel {product.shelf}·{product.slot + 1}</p>
          </div>
          <div className="p-3 rounded-md bg-secondary/60 col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Disponibilidad</p>
            <p className={`font-semibold ${s === "empty" ? "text-stock-critical" : "text-stock-ok"}`}>
              {s === "empty" ? "Agotado" : `${product.stock} unidades — ${statusLabel[s]}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
