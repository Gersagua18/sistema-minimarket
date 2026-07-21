import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Store as StoreIcon, KeyRound, User as UserIcon, ArrowLeft, ShoppingBasket, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";

export default function StoreLogin() {
  const { store, storeLogin, exitStore, account } = useStore();
  const [u, setU] = useState(store?.ownerUsername === account?.username ? account?.username ?? "" : "");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!store) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(storeLogin(u, p));
  };

  const quick = (user: string, pass: string) => {
    setU(user); setP(pass);
    setErr(storeLogin(user, pass));
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md">
        <button onClick={exitStore}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Otra tienda
        </button>

        <div className="bg-card border border-border rounded p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
            <div className="w-12 h-12 rounded bg-primary text-primary-foreground grid place-items-center">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">{store.name}</p>
              <p className="text-xs text-muted-foreground">{store.address}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <h2 className="font-display text-xl font-bold">Acceso del personal</h2>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Usuario</span>
              <div className="mt-1 relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={u} onChange={(e) => setU(e.target.value)} required
                  className="w-full pl-10 pr-3 py-2.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Contraseña</span>
              <div className="mt-1 relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={p} onChange={(e) => setP(e.target.value)} required
                  className="w-full pl-10 pr-3 py-2.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>

            {err && <div className="text-sm text-stock-critical bg-stock-critical-soft px-3 py-2 rounded">{err}</div>}

            <button type="submit" className="w-full py-2.5 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Entrar
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground">Atajos demo:</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quick("admin", "admin")}
                className="p-2.5 rounded border border-border hover:border-primary text-left transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">admin / admin</p>
              </button>
              <button onClick={() => quick("caja", "caja")}
                className="p-2.5 rounded border border-border hover:border-primary text-left transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <UserIcon className="w-3.5 h-3.5" /> Empleado
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">caja / caja</p>
              </button>
            </div>

            <Link to="/portalcliente"
              className="w-full p-3 rounded border border-dashed border-border hover:border-accent hover:text-accent text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
              <ShoppingBasket className="w-4 h-4" /> Ir al portal cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
