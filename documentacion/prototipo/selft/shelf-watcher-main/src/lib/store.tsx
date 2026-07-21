import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  templateProducts,
  defaultShelves,
  type Product,
  type ShelfDef,
} from "./inventory-data";

export type StoreRole = "admin" | "empleado" | "cliente";

export interface Account {
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface StoreUser {
  username: string;
  password: string;
  name: string;
  role: "admin" | "empleado";
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}
export interface Sale {
  id: string;
  at: number;
  cashier: string;
  items: SaleItem[];
  total: number;
}

export interface Tienda {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  ownerUsername: string;
  products: Product[];
  shelves: ShelfDef[];
  users: StoreUser[];
  sales: Sale[];
}

export interface SessionUser {
  username: string;
  name: string;
  role: StoreRole;
}

export interface CreateStoreInput {
  name: string;
  address: string;
  city: string;
  region: string;
  shelves: ShelfDef[];
  products: Product[];
  adminUsername: string;
  adminName: string;
  adminPassword: string;
}

interface Ctx {
  account: Account | null;
  accounts: Account[];
  signIn: (u: string, p: string) => string | null;
  signUp: (a: Account) => string | null;
  signOutAccount: () => void;

  stores: Tienda[];
  createStore: (s: CreateStoreInput) => string;
  deleteStore: (id: string) => void;

  currentStoreId: string | null;
  currentUser: SessionUser | null;
  selectStore: (id: string) => void;
  exitStore: () => void;
  storeLogin: (u: string, p: string) => string | null;
  enterAsClient: () => void;
  logoutStoreUser: () => void;
  verifyAdminPassword: (password: string) => boolean;

  store: Tienda | null;
  updateStore: (patch: Partial<Tienda>) => void;
  restock: (id: string, units: number) => void;
  moveProduct: (id: string, shelf: string, slot: number) => void;
  registerSale: (items: SaleItem[]) => void;
  upsertProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  addStoreUser: (u: StoreUser, adminPassword: string) => string | null;
  removeStoreUser: (username: string, adminPassword: string) => string | null;

  products: Product[];
  sales: Sale[];
  user: SessionUser | null;
}

const C = createContext<Ctx | null>(null);
export const useStore = () => {
  const v = useContext(C);
  if (!v) throw new Error("useStore outside provider");
  return v;
};

const seedAccounts: Account[] = [
  { username: "demo", password: "demo", name: "Lucía Vega", email: "lucia@ministock.pe" },
];

function seedSales(products: Product[]): Sale[] {
  const out: Sale[] = [];
  const now = Date.now();
  const day = 86400000;
  for (let d = 6; d >= 0; d--) {
    const n = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < n; i++) {
      const items = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, 1 + Math.floor(Math.random() * 3))
        .map((p) => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: 1 + Math.floor(Math.random() * 4),
        }));
      const total = items.reduce((s, it) => s + it.price * it.qty, 0) * 1.18;
      out.push({
        id: `s-${d}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        at: now - d * day - Math.random() * day,
        cashier: Math.random() > 0.5 ? "Marco Salas" : "Lucía Vega",
        items,
        total,
      });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

const seedStore: Tienda = {
  id: "tienda-demo",
  name: "MiniMarket Central",
  address: "Av. Mariscal Castilla 320",
  city: "Ilo",
  region: "Moquegua",
  ownerUsername: "demo",
  products: templateProducts,
  shelves: defaultShelves,
  users: [
    { username: "admin", password: "admin", name: "Lucía Vega", role: "admin" },
    { username: "caja", password: "caja", name: "Marco Salas", role: "empleado" },
    { username: "reposicion", password: "reposicion", name: "Ana Torres", role: "empleado" },
  ],
  sales: seedSales(templateProducts),
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [account, setAccount] = useState<Account | null>(null);
  const [stores, setStores] = useState<Tienda[]>([seedStore]);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  const store = useMemo(
    () => stores.find((s) => s.id === currentStoreId) ?? null,
    [stores, currentStoreId],
  );

  const patchStore = (patch: Partial<Tienda> | ((s: Tienda) => Tienda)) =>
    setStores((all) =>
      all.map((s) =>
        s.id === currentStoreId
          ? typeof patch === "function"
            ? patch(s)
            : { ...s, ...patch }
          : s,
      ),
    );

  const verifyAdminPassword = (password: string) => {
    if (!store) return false;
    return store.users.some((u) => u.role === "admin" && u.password === password);
  };

  const value: Ctx = {
    account,
    accounts,
    signIn: (u, p) => {
      const a = accounts.find((x) => x.username.toLowerCase() === u.toLowerCase().trim());
      if (!a) return "Cuenta no encontrada";
      if (a.password !== p) return "Contraseña incorrecta";
      setAccount(a);
      return null;
    },
    signUp: (a) => {
      if (!a.username.trim() || !a.password) return "Usuario y contraseña requeridos";
      if (accounts.find((x) => x.username.toLowerCase() === a.username.toLowerCase()))
        return "El usuario ya existe";
      setAccounts((as) => [...as, a]);
      setAccount(a);
      return null;
    },
    signOutAccount: () => {
      setAccount(null);
      setCurrentStoreId(null);
      setCurrentUser(null);
    },

    stores,
    createStore: (s) => {
      const id = `t-${Date.now()}`;
      const adminUser: StoreUser = {
        username: s.adminUsername,
        password: s.adminPassword,
        name: s.adminName,
        role: "admin",
      };
      const newStore: Tienda = {
        id,
        name: s.name,
        address: s.address,
        city: s.city,
        region: s.region,
        ownerUsername: account?.username ?? s.adminUsername,
        products: s.products,
        shelves: s.shelves,
        users: [adminUser],
        sales: [],
      };
      setStores((all) => [...all, newStore]);
      return id;
    },
    deleteStore: (id) => setStores((all) => all.filter((s) => s.id !== id)),

    currentStoreId,
    currentUser,
    selectStore: (id) => {
      setCurrentStoreId(id);
      setCurrentUser(null);
    },
    exitStore: () => {
      setCurrentStoreId(null);
      setCurrentUser(null);
    },
    storeLogin: (u, p) => {
      if (!store) return "No hay tienda seleccionada";
      const su = store.users.find((x) => x.username.toLowerCase() === u.toLowerCase().trim());
      if (!su) return "Usuario no encontrado en esta tienda";
      if (su.password !== p) return "Contraseña incorrecta";
      setCurrentUser({ username: su.username, name: su.name, role: su.role });
      return null;
    },
    enterAsClient: () => {
      if (!store) return;
      setCurrentUser({
        username: account?.username ?? "invitado",
        name: account?.name ?? "Cliente",
        role: "cliente",
      });
    },
    logoutStoreUser: () => setCurrentUser(null),
    verifyAdminPassword,

    store,
    updateStore: (patch) => patchStore(patch),
    restock: (id, units) =>
      patchStore((s) => ({
        ...s,
        products: s.products.map((p) =>
          p.id === id ? { ...p, stock: Math.max(0, p.stock + units) } : p,
        ),
      })),
    moveProduct: (id, shelf, slot) =>
      patchStore((s) => {
        const me = s.products.find((p) => p.id === id);
        if (!me) return s;
        const target = s.products.find(
          (p) => p.shelf === shelf && p.slot === slot && p.id !== id,
        );
        return {
          ...s,
          products: s.products.map((p) => {
            if (p.id === id) return { ...p, shelf, slot };
            if (target && p.id === target.id)
              return { ...p, shelf: me.shelf, slot: me.slot };
            return p;
          }),
        };
      }),
    registerSale: (items) => {
      const total = items.reduce((s, it) => s + it.price * it.qty, 0) * 1.18;
      const sale: Sale = {
        id: `s-${Date.now()}`,
        at: Date.now(),
        cashier: currentUser?.name ?? "Anónimo",
        items,
        total,
      };
      patchStore((s) => ({
        ...s,
        sales: [...s.sales, sale],
        products: s.products.map((p) => {
          const it = items.find((i) => i.productId === p.id);
          return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
        }),
      }));
    },
    upsertProduct: (p) =>
      patchStore((s) => {
        const exists = s.products.some((x) => x.id === p.id);
        return {
          ...s,
          products: exists
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        };
      }),
    removeProduct: (id) =>
      patchStore((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) })),
    addStoreUser: (u, adminPassword) => {
      if (!store) return "No hay tienda";
      if (!verifyAdminPassword(adminPassword)) return "Contraseña de administrador incorrecta";
      if (!u.username.trim() || !u.password || !u.name.trim()) return "Completa todos los campos";
      if (store.users.some((x) => x.username.toLowerCase() === u.username.toLowerCase()))
        return "Ese usuario ya existe en esta tienda";
      patchStore((s) => ({ ...s, users: [...s.users, u] }));
      return null;
    },
    removeStoreUser: (username, adminPassword) => {
      if (!store) return "No hay tienda";
      if (!verifyAdminPassword(adminPassword)) return "Contraseña de administrador incorrecta";
      if (store.ownerUsername === username) return "No puedes eliminar al propietario";
      patchStore((s) => ({
        ...s,
        users: s.users.filter((u) => u.username !== username),
      }));
      return null;
    },

    products: store?.products ?? [],
    sales: store?.sales ?? [],
    user: currentUser,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}
