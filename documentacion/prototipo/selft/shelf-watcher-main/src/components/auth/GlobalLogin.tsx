import { useState } from "react";
import { Store, KeyRound, User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";

export default function GlobalLogin() {
  const { signIn, signUp } = useStore();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ username: "", password: "", name: "", email: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const error =
      mode === "in"
        ? signIn(form.username, form.password)
        : signUp({
            username: form.username.trim(),
            password: form.password,
            name: form.name || form.username,
            email: form.email,
          });
    setErr(error);
  };

  const quick = () => {
    setForm((f) => ({ ...f, username: "demo", password: "demo" }));
    setErr(signIn("demo", "demo"));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[oklch(0.22_0.05_258)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 30% 20%, oklch(0.55 0.18 250 / 0.7), transparent 50%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white text-primary grid place-items-center rounded">
              <Store className="w-6 h-6" />
            </div>
            <span className="font-display text-2xl font-bold">MiniStock Suite</span>
          </div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Gestión profesional de minimarkets con control visual de anaqueles
          </h2>
          <p className="text-white/70 leading-relaxed">
            Administra múltiples tiendas, controla inventario en tiempo real con
            visualización 2.5D, procesa ventas y obtén reportes ejecutivos. Una
            sola plataforma para administradores, empleados y clientes.
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• Visualización 2.5D de anaqueles con códigos de color</li>
            <li>• Roles: Administrador, Empleado y Portal Cliente</li>
            <li>• Multi-tienda con configuración personalizada</li>
            <li>• Alertas automáticas de stock bajo y reportes</li>
          </ul>
        </div>
        <div className="relative text-xs text-white/50">© MiniStock · Trazabilidad y control</div>
      </div>

      <div className="grid place-items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary text-primary-foreground grid place-items-center rounded">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-bold">MiniStock</span>
          </div>

          <div className="flex bg-secondary p-1 rounded mb-6">
            <button
              onClick={() => { setMode("in"); setErr(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                mode === "in" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}>
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode("up"); setErr(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
                mode === "up" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}>
              Crear cuenta
            </button>
          </div>

          <form onSubmit={submit} className="bg-card border border-border rounded p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {mode === "in" ? "Bienvenido" : "Crea tu cuenta"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "in"
                  ? "Accede a la gestión de tus tiendas"
                  : "Una cuenta puede administrar múltiples minimarkets"}
              </p>
            </div>

            {mode === "up" && (
              <>
                <Field icon={UserIcon} label="Nombre completo"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })} />
                <Field icon={Mail} label="Correo" type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })} />
              </>
            )}
            <Field icon={UserIcon} label="Usuario"
              value={form.username}
              onChange={(v) => setForm({ ...form, username: v })} />
            <Field icon={KeyRound} label="Contraseña" type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })} />

            {err && <div className="text-sm text-stock-critical bg-stock-critical-soft px-3 py-2 rounded">{err}</div>}

            <button type="submit" className="w-full py-2.5 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors active:scale-[0.99]">
              {mode === "in" ? "Entrar" : "Crear cuenta"}
            </button>

            {mode === "in" && (
              <button type="button" onClick={quick}
                className="w-full p-3 rounded border border-dashed border-border hover:border-primary text-left text-xs transition-colors">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <ShieldCheck className="w-4 h-4" /> Cuenta demo
                </div>
                <p className="text-muted-foreground mt-0.5">
                  demo / demo · accede a "MiniMarket Central" con datos cargados
                </p>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text" }: {
  icon: any; label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required
          className="w-full pl-10 pr-3 py-2.5 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
      </div>
    </label>
  );
}
