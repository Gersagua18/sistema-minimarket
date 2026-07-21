import { useState } from "react";
import { Plus, Store as StoreIcon, MapPin, Trash2, LogOut, ChevronRight, Building2, ShieldCheck, X, Check, KeyRound, User as UserIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  defaultShelves,
  templateProducts,
  type Product,
  type ShelfDef,
} from "@/lib/inventory-data";

export default function StoreSelect() {
  const { account, stores, signOutAccount, selectStore, deleteStore } = useStore();
  const [wizard, setWizard] = useState(false);
  const mine = stores.filter((s) => s.ownerUsername === account?.username);
  const others = stores.filter((s) => s.ownerUsername !== account?.username);

  if (wizard) return <SetupWizard onClose={() => setWizard(false)} />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary text-primary-foreground grid place-items-center">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-tight">MiniStock · Panel</p>
              <p className="text-xs text-muted-foreground">Selecciona tu tienda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{account?.name}</p>
              <p className="text-xs text-muted-foreground">{account?.email || account?.username}</p>
            </div>
            <button onClick={signOutAccount}
              className="px-3 py-2 rounded border border-border hover:bg-secondary text-xs font-medium inline-flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Mis tiendas</h2>
              <p className="text-sm text-muted-foreground">Minimarkets que administras directamente</p>
            </div>
            <button onClick={() => setWizard(true)}
              className="px-4 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98]">
              <Plus className="w-4 h-4" /> Nueva tienda
            </button>
          </div>

          {mine.length === 0 ? (
            <div className="border border-dashed border-border rounded p-10 text-center bg-card">
              <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aún no has creado ninguna tienda</p>
              <button onClick={() => setWizard(true)}
                className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold">
                Configurar mi primer minimarket
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mine.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded bg-primary-soft text-primary grid place-items-center">
                      <StoreIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-primary-soft text-primary px-2 py-0.5 rounded">
                      Propietario
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg">{s.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {s.address}, {s.city}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <Mini label="Anaqueles" value={s.shelves.length} />
                    <Mini label="Productos" value={s.products.length} />
                    <Mini label="Usuarios" value={s.users.length} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => selectStore(s.id)}
                      className="flex-1 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1 hover:bg-primary/90 active:scale-[0.98]">
                      Ingresar <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm(`¿Eliminar "${s.name}"?`)) deleteStore(s.id); }}
                      title="Eliminar tienda"
                      className="w-9 grid place-items-center rounded border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {others.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-1">Otras tiendas</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ingresa como personal autorizado con tus credenciales de tienda
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="w-11 h-11 rounded bg-accent-soft text-accent grid place-items-center mb-3">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{s.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {s.address}, {s.city}
                  </p>
                  <button onClick={() => selectStore(s.id)}
                    className="mt-4 w-full py-2 rounded bg-secondary hover:bg-secondary/70 text-sm font-semibold inline-flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Acceso staff
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-secondary/60 rounded p-2">
      <p className="font-display font-bold text-lg">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

// ============= Setup wizard =============
function SetupWizard({ onClose }: { onClose: () => void }) {
  const { createStore, selectStore, account } = useStore();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ name: "", address: "", city: "", region: "" });
  const [creds, setCreds] = useState({
    adminUsername: account?.username ?? "admin",
    adminName: account?.name ?? "Administrador",
    adminPassword: "",
    adminPassword2: "",
  });
  const [shelves, setShelves] = useState<ShelfDef[]>(defaultShelves.slice(0, 4));
  const [seedTemplate, setSeedTemplate] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const steps = ["Ubicación de la tienda", "Credenciales de acceso", "Anaqueles", "Productos", "Confirmación"];

  const canStep0 = info.name.trim() && info.address.trim() && info.city.trim() && info.region.trim();
  const canStep1 =
    creds.adminUsername.trim().length >= 3 &&
    creds.adminName.trim().length >= 2 &&
    creds.adminPassword.length >= 4 &&
    creds.adminPassword === creds.adminPassword2;

  const finish = () => {
    setErr(null);
    if (!canStep1) { setErr("Revisa las credenciales de administrador"); return; }
    const finalProducts: Product[] = seedTemplate
      ? templateProducts.filter((p) => shelves.some((sh) => sh.id === p.shelf))
      : [];
    const id = createStore({
      name: info.name,
      address: info.address,
      city: info.city,
      region: info.region,
      shelves,
      products: finalProducts,
      adminUsername: creds.adminUsername.trim(),
      adminName: creds.adminName.trim(),
      adminPassword: creds.adminPassword,
    });
    selectStore(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold">Configurar minimarket</p>
            <p className="text-xs text-muted-foreground">Paso {step + 1} de {steps.length} — {steps[step]}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-1 bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 py-10">
        {step === 0 && (
          <Card title="Datos y ubicación" sub="Dónde queda tu minimarket">
            <FieldX label="Nombre comercial" value={info.name} onChange={(v) => setInfo({ ...info, name: v })} placeholder="MiniMarket Don José" />
            <FieldX label="Dirección" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} placeholder="Av. Mariscal Castilla 320" />
            <div className="grid grid-cols-2 gap-4">
              <FieldX label="Ciudad" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} placeholder="Ilo" />
              <FieldX label="Región / Departamento" value={info.region} onChange={(v) => setInfo({ ...info, region: v })} placeholder="Moquegua" />
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card title="Credenciales del administrador"
            sub="Con estos datos se iniciará sesión en la tienda. Podrás crear más usuarios luego.">
            <div className="grid grid-cols-2 gap-4">
              <FieldX icon={UserIcon} label="Usuario administrador"
                value={creds.adminUsername} onChange={(v) => setCreds({ ...creds, adminUsername: v.replace(/\s+/g, "").toLowerCase() })}
                placeholder="admin" />
              <FieldX label="Nombre a mostrar"
                value={creds.adminName} onChange={(v) => setCreds({ ...creds, adminName: v })}
                placeholder="Juan Pérez" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FieldX icon={KeyRound} label="Contraseña" type="password"
                value={creds.adminPassword} onChange={(v) => setCreds({ ...creds, adminPassword: v })} />
              <FieldX icon={KeyRound} label="Repetir contraseña" type="password"
                value={creds.adminPassword2} onChange={(v) => setCreds({ ...creds, adminPassword2: v })} />
            </div>
            {creds.adminPassword && creds.adminPassword2 && creds.adminPassword !== creds.adminPassword2 && (
              <p className="text-xs text-stock-critical">Las contraseñas no coinciden</p>
            )}
            <div className="text-xs text-muted-foreground bg-accent-soft/50 border border-accent/20 rounded p-3">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-accent" />
              Esta contraseña será requerida para agregar o eliminar empleados y para acciones sensibles.
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Distribución de anaqueles" sub="Define los estantes físicos de tu tienda">
            <div className="flex justify-end">
              <button onClick={() => setShelves([...shelves, { id: `N${shelves.length + 1}`, label: `Estante ${shelves.length + 1}`, category: "General", slots: 4 }])}
                className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1">
                <Plus className="w-4 h-4" /> Anaquel
              </button>
            </div>
            <div className="space-y-2">
              {shelves.map((sh, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 rounded border border-border">
                  <input value={sh.id} onChange={(e) => setShelves(shelves.map((x, j) => j === i ? { ...x, id: e.target.value } : x))}
                    className="col-span-2 px-2 py-1.5 rounded border border-border text-sm font-mono" />
                  <input value={sh.label} onChange={(e) => setShelves(shelves.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                    className="col-span-4 px-2 py-1.5 rounded border border-border text-sm" />
                  <input value={sh.category} onChange={(e) => setShelves(shelves.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}
                    className="col-span-3 px-2 py-1.5 rounded border border-border text-sm" />
                  <input type="number" min={1} max={8} value={sh.slots} onChange={(e) => setShelves(shelves.map((x, j) => j === i ? { ...x, slots: Number(e.target.value) } : x))}
                    className="col-span-2 px-2 py-1.5 rounded border border-border text-sm" />
                  <button onClick={() => setShelves(shelves.filter((_, j) => j !== i))} className="col-span-1 grid place-items-center text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card title="Productos iniciales" sub="Elige cómo comenzar tu catálogo">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSeedTemplate(true)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  seedTemplate ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"
                }`}>
                <p className="font-semibold">Cargar catálogo demo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Importa ~28 productos típicos de minimarket peruano.
                </p>
              </button>
              <button onClick={() => setSeedTemplate(false)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  !seedTemplate ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"
                }`}>
                <p className="font-semibold">Empezar vacío</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agregarás productos manualmente desde Productos.
                </p>
              </button>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card title="Confirmación" sub="Revisa los datos antes de crear la tienda">
            <Summary label="Nombre" value={info.name} />
            <Summary label="Dirección" value={`${info.address}, ${info.city}, ${info.region}`} />
            <Summary label="Administrador" value={`${creds.adminName} (@${creds.adminUsername})`} />
            <Summary label="Anaqueles" value={`${shelves.length} estantes (${shelves.reduce((s, x) => s + x.slots, 0)} casillas)`} />
            <Summary label="Productos" value={seedTemplate ? "Catálogo demo precargado" : "Empezar vacío"} />
            {err && <div className="text-sm text-stock-critical bg-stock-critical-soft px-3 py-2 rounded">{err}</div>}
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="px-4 py-2.5 rounded border border-border hover:bg-secondary text-sm font-semibold">
            {step === 0 ? "Cancelar" : "Atrás"}
          </button>
          {step < steps.length - 1 ? (
            <button
              disabled={(step === 0 && !canStep0) || (step === 1 && !canStep1)}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-1">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish}
              className="px-5 py-2.5 rounded bg-stock-ok text-white text-sm font-semibold inline-flex items-center gap-1">
              <Check className="w-4 h-4" /> Crear minimarket
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldX({ label, value, onChange, placeholder, type = "text", icon: Icon }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: any;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
      </div>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="font-semibold text-sm text-right">{value}</span>
    </div>
  );
}
