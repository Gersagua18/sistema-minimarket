import { useState } from "react";
import {
  LayoutDashboard, LayoutGrid, Boxes, ScanBarcode, BarChart3, Store as StoreIcon, LogOut,
  ShieldCheck, User as UserIcon, X, Tag, MapPin, AlertTriangle, Users, ChevronsLeftRight,
} from "lucide-react";
import { StoreProvider, useStore } from "@/lib/store";
import GlobalLogin from "./auth/GlobalLogin";
import StoreSelect from "./auth/StoreSelect";
import StoreLogin from "./auth/StoreLogin";
import DashboardAdmin from "./views/DashboardAdmin";
import WorkerDashboard from "./views/WorkerDashboard";
import Shelves25D from "./views/Shelves25D";
import SalesView from "./views/SalesView";
import ProductsView from "./views/ProductsView";
import ReportsView from "./views/ReportsView";
import UsersView from "./views/UsersView";
import { statusOf, statusLabel, type Product, type StockStatus } from "@/lib/inventory-data";

export default function MinimarketApp() {
  return (
    <StoreProvider>
      <Gate />
    </StoreProvider>
  );
}

function Gate() {
  const { account, currentStoreId, currentUser } = useStore();
  if (!account) return <GlobalLogin />;
  if (!currentStoreId) return <StoreSelect />;
  if (!currentUser) return <StoreLogin />;
  return currentUser.role === "admin" ? <AdminShell /> : <EmpleadoShell />;
}

type AdminView = "dashboard" | "anaqueles" | "productos" | "ventas" | "reportes" | "usuarios";
type EmpView = "dashboard" | "anaqueles" | "ventas" | "inventario";

const statusBg: Record<StockStatus, string> = {
  ok: "bg-stock-ok text-white",
  low: "bg-stock-low text-foreground",
  critical: "bg-stock-critical text-white",
  empty: "bg-stock-empty text-muted-foreground",
};

function AdminShell() {
  const [view, setView] = useState<AdminView>("dashboard");
  const [selected, setSelected] = useState<Product | null>(null);
  const map: Record<AdminView, { title: string; sub: string }> = {
    dashboard: { title: "Dashboard ejecutivo", sub: "KPIs de ventas, alertas y top productos" },
    anaqueles: { title: "Anaqueles 2.5D", sub: "Visualización tridimensional editable" },
    productos: { title: "Productos", sub: "Catálogo completo y gestión de stock" },
    ventas: { title: "Punto de venta", sub: "Registra ventas y emite boletas" },
    reportes: { title: "Reportes", sub: "Análisis e indicadores de gestión" },
    usuarios: { title: "Usuarios", sub: "Gestión de personal y accesos" },
  };
  return (
    <Layout title={map[view].title} subtitle={map[view].sub}
      roleBadge={{ icon: ShieldCheck, label: "Administrador", tone: "primary" }}
      nav={
        <>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavItem icon={LayoutGrid} label="Anaqueles 2.5D" active={view === "anaqueles"} onClick={() => setView("anaqueles")} />
          <NavItem icon={Boxes} label="Productos" active={view === "productos"} onClick={() => setView("productos")} />
          <NavItem icon={ScanBarcode} label="Punto de venta" active={view === "ventas"} onClick={() => setView("ventas")} />
          <NavItem icon={BarChart3} label="Reportes" active={view === "reportes"} onClick={() => setView("reportes")} />
          <NavItem icon={Users} label="Usuarios" active={view === "usuarios"} onClick={() => setView("usuarios")} />
        </>
      }>
      {view === "dashboard" && <DashboardAdmin />}
      {view === "anaqueles" && <Shelves25D editable onSelect={setSelected} />}
      {view === "productos" && <ProductsView canEdit />}
      {view === "ventas" && <SalesView />}
      {view === "reportes" && <ReportsView />}
      {view === "usuarios" && <UsersView />}
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}

function EmpleadoShell() {
  const [view, setView] = useState<EmpView>("dashboard");
  const [selected, setSelected] = useState<Product | null>(null);
  const map: Record<EmpView, { title: string; sub: string }> = {
    dashboard: { title: "Mi día", sub: "Tu desempeño e ingresos diarios" },
    anaqueles: { title: "Anaqueles 2.5D", sub: "Identifica visualmente los productos por reponer" },
    ventas: { title: "Punto de venta", sub: "Procesa ventas y genera boletas" },
    inventario: { title: "Inventario", sub: "Consulta y reposición de stock" },
  };
  return (
    <Layout title={map[view].title} subtitle={map[view].sub}
      roleBadge={{ icon: UserIcon, label: "Empleado", tone: "accent" }}
      nav={
        <>
          <NavItem icon={LayoutDashboard} label="Mi día" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavItem icon={LayoutGrid} label="Anaqueles 2.5D" active={view === "anaqueles"} onClick={() => setView("anaqueles")} />
          <NavItem icon={ScanBarcode} label="Punto de venta" active={view === "ventas"} onClick={() => setView("ventas")} />
          <NavItem icon={Boxes} label="Inventario" active={view === "inventario"} onClick={() => setView("inventario")} />
        </>
      }>
      {view === "dashboard" && <WorkerDashboard />}
      {view === "anaqueles" && <Shelves25D onSelect={setSelected} />}
      {view === "ventas" && <SalesView />}
      {view === "inventario" && <ProductsView canEdit />}
      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}

function Layout({ title, subtitle, roleBadge, nav, children }: {
  title: string; subtitle: string;
  roleBadge: { icon: any; label: string; tone: "primary" | "accent" };
  nav: React.ReactNode; children: React.ReactNode;
}) {
  const { user, logoutStoreUser, exitStore, store } = useStore();
  const Icon = roleBadge.icon;
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white text-primary grid place-items-center">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold leading-tight truncate">{store?.name}</h1>
              <p className="text-[11px] text-white/60 truncate">{store?.address}</p>
            </div>
          </div>
          <button onClick={exitStore}
            className="mt-3 w-full text-xs text-white/70 hover:text-white inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <ChevronsLeftRight className="w-3.5 h-3.5" /> Cambiar tienda
          </button>
        </div>
        <nav className="p-3 flex-1 space-y-1">{nav}</nav>
        <div className="m-3 p-3 rounded bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded grid place-items-center ${roleBadge.tone === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/60">{roleBadge.label}</p>
            </div>
          </div>
          <button onClick={logoutStoreUser}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="px-8 pt-8 pb-4">
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </header>
        <section className="p-8 pt-2">{children}</section>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors active:scale-[0.98] ${
        active ? "bg-primary text-primary-foreground" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}>
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const s = statusOf(product);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded border border-border w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded hover:bg-secondary grid place-items-center">
          <X className="w-4 h-4" />
        </button>
        <div className={`w-full aspect-video rounded ${statusBg[s]} grid place-items-center mb-5`}>
          <Boxes className="w-16 h-16 opacity-80" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.category}</span>
        <h3 className="font-display text-2xl font-bold mt-1 mb-4">{product.name}</h3>
        <div className="grid grid-cols-2 gap-3">
          <DetailBox icon={Tag} label="Precio" value={`S/ ${product.price.toFixed(2)}`} />
          <DetailBox icon={MapPin} label="Ubicación" value={`Anaquel ${product.shelf}`} />
          <DetailBox icon={Boxes} label="Stock actual" value={`${product.stock} und`} />
          <DetailBox icon={AlertTriangle} label="Estado" value={statusLabel[s]} />
        </div>
      </div>
    </div>
  );
}

function DetailBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded bg-secondary/60">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="w-3 h-3" />{label}
      </div>
      <p className="font-display font-bold">{value}</p>
    </div>
  );
}
