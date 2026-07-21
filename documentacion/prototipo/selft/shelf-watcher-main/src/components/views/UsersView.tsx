import { useState } from "react";
import { Users, Plus, Trash2, ShieldCheck, User as UserIcon, X, KeyRound, Lock } from "lucide-react";
import { useStore } from "@/lib/store";

export default function UsersView() {
  const { store, addStoreUser, removeStoreUser, user } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "empleado" as "admin" | "empleado", adminPassword: "" });
  const [err, setErr] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ username: string; adminPassword: string } | null>(null);

  if (!store) return null;

  const submit = () => {
    const { adminPassword, ...u } = form;
    const e = addStoreUser(u, adminPassword);
    if (e) setErr(e);
    else {
      setOpen(false);
      setForm({ username: "", password: "", name: "", role: "empleado", adminPassword: "" });
      setErr(null);
    }
  };

  const doDelete = () => {
    if (!confirm) return;
    const e = removeStoreUser(confirm.username, confirm.adminPassword);
    if (e) setErr(e);
    else { setConfirm(null); setErr(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Usuarios de la tienda</h3>
          <p className="text-sm text-muted-foreground">Solo el administrador puede modificar accesos.</p>
        </div>
        <button onClick={() => { setErr(null); setOpen(true); }}
          className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Nombre</th>
              <th className="px-5 py-3 text-left">Rol</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {store.users.map((u) => {
              const isMe = u.username === user?.username;
              const isOwner = store.ownerUsername === u.username;
              return (
                <tr key={u.username} className="border-t border-border">
                  <td className="px-5 py-3 font-mono">{u.username}{isOwner && <span className="ml-2 text-[10px] uppercase text-accent">propietario</span>}</td>
                  <td className="px-5 py-3">{u.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                      u.role === "admin" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
                    }`}>
                      {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {u.role === "admin" ? "Administrador" : "Empleado"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => { setErr(null); setConfirm({ username: u.username, adminPassword: "" }); }}
                      disabled={isMe || isOwner}
                      className="px-2.5 py-1.5 rounded text-xs border border-border hover:border-destructive hover:text-destructive transition-colors inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground inline-flex items-start gap-2 max-w-2xl">
        <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Los <strong>empleados</strong> venden, reponen stock y consultan inventario.
          Los <strong>administradores</strong> además gestionan productos, usuarios y reportes.
          Por seguridad, agregar o eliminar usuarios requiere confirmar la contraseña del administrador.
        </span>
      </div>

      {open && (
        <Modal onClose={() => setOpen(false)} title="Nuevo usuario">
          <div className="space-y-3">
            <FieldX label="Nombre completo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FieldX label="Usuario" value={form.username} onChange={(v) => setForm({ ...form, username: v.replace(/\s+/g, "").toLowerCase() })} />
            <FieldX label="Contraseña" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Rol</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["empleado", "admin"] as const).map((r) => (
                  <button key={r} onClick={() => setForm({ ...form, role: r })}
                    className={`p-3 rounded-md border-2 text-left transition-colors ${
                      form.role === r ? "border-primary bg-primary-soft" : "border-border"
                    }`}>
                    <p className="text-sm font-semibold">{r === "admin" ? "Administrador" : "Empleado"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {r === "admin" ? "Acceso total" : "Ventas y reposición"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-1">
                <Lock className="w-3 h-3" /> Confirma con tu contraseña de administrador
              </div>
              <FieldX label="Contraseña de admin" type="password" icon={KeyRound}
                value={form.adminPassword} onChange={(v) => setForm({ ...form, adminPassword: v })} />
            </div>
            {err && <div className="text-sm text-stock-critical bg-stock-critical-soft px-3 py-2 rounded">{err}</div>}
            <button onClick={submit} className="w-full py-2.5 rounded bg-primary text-primary-foreground font-semibold">
              Crear usuario
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Modal onClose={() => setConfirm(null)} title="Eliminar usuario">
          <p className="text-sm text-muted-foreground mb-3">
            Vas a eliminar a <strong className="text-foreground font-mono">{confirm.username}</strong>. Esta acción no se puede deshacer.
          </p>
          <FieldX label="Contraseña de administrador" type="password" icon={KeyRound}
            value={confirm.adminPassword} onChange={(v) => setConfirm({ ...confirm, adminPassword: v })} />
          {err && <div className="text-sm text-stock-critical bg-stock-critical-soft px-3 py-2 rounded mt-2">{err}</div>}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded border border-border font-semibold text-sm">Cancelar</button>
            <button onClick={doDelete} className="flex-1 py-2.5 rounded bg-destructive text-destructive-foreground font-semibold text-sm">Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 grid place-items-center rounded hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-display text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FieldX({ label, value, onChange, type = "text", icon: Icon }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; icon?: any;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
      </div>
    </label>
  );
}
