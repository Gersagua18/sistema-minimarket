import { createFileRoute, Link } from "@tanstack/react-router";
import { Store as StoreIcon, ShoppingBasket, LayoutGrid, ShieldCheck, ArrowRight, Boxes, BarChart3, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MiniStock — Gestión visual de minimarkets" },
      { name: "description", content: "Plataforma con portal cliente y panel de gestión: anaqueles 2.5D, control de stock por colores, ventas y reportes." },
      { property: "og:title", content: "MiniStock — Gestión visual de minimarkets" },
      { property: "og:description", content: "Portal cliente y panel administrativo para minimarkets." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-primary text-primary-foreground grid place-items-center">
            <StoreIcon className="w-5 h-5" />
          </div>
          <span className="font-display text-lg font-bold">MiniStock</span>
        </div>
        <Link to="/panel" className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          Ingresar al panel <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-6 pb-20">
        <section className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-accent bg-accent-soft px-3 py-1 rounded mb-5">
            Control visual · Anaqueles 2.5D
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Tu minimarket, <span className="text-primary">bajo control</span> con un vistazo.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Cada caja del anaquel cambia de color según el stock. Los clientes encuentran
            productos al instante y el personal detecta qué reponer sin abrir un Excel.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <Link to="/portalcliente"
            className="group bg-card border border-border rounded-lg p-8 hover:border-accent hover:-translate-y-0.5 transition-all shadow-sm">
            <div className="w-12 h-12 rounded bg-accent-soft text-accent grid place-items-center mb-5">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-wide font-semibold text-accent mb-1">Público</p>
            <h2 className="font-display text-2xl font-bold mb-2">Portal Cliente</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Elige la tienda, explora el catálogo y ubica cada producto en el mapa de anaqueles.
              Sin registro necesario.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
              Explorar catálogo <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link to="/panel"
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:-translate-y-0.5 transition-all shadow-sm">
            <div className="w-12 h-12 rounded bg-primary-soft text-primary grid place-items-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1">Staff</p>
            <h2 className="font-display text-2xl font-bold mb-2">Panel de gestión</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Administradores y empleados: inventario, ventas, anaqueles 2.5D editables,
              reportes y gestión de personal.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 mt-14 max-w-4xl mx-auto">
          <Feature icon={LayoutGrid} title="Anaqueles 2.5D" text="Vista tridimensional editable con cajas que cambian de color por stock." />
          <Feature icon={Boxes} title="Multi-tienda" text="Administra varios minimarkets desde una sola cuenta con roles por tienda." />
          <Feature icon={BarChart3} title="Reportes en vivo" text="Ventas del día, top productos y alertas automáticas de reposición." />
        </section>
      </main>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="p-5 rounded-lg bg-card/70 border border-border">
      <Icon className="w-5 h-5 text-primary mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
