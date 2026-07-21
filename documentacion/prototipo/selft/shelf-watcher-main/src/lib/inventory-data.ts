export type StockStatus = "ok" | "low" | "critical" | "empty";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  shelf: string;
  slot: number;
}

export interface ShelfDef {
  id: string;
  label: string;
  category: string;
  slots: number;
}

export const defaultShelves: ShelfDef[] = [
  { id: "A1", label: "Limpieza A1", category: "Limpieza", slots: 4 },
  { id: "A2", label: "Limpieza A2", category: "Limpieza", slots: 4 },
  { id: "B1", label: "Abarrotes B1", category: "Abarrotes", slots: 4 },
  { id: "B2", label: "Abarrotes B2", category: "Abarrotes", slots: 4 },
  { id: "C1", label: "Bebidas C1", category: "Bebidas", slots: 4 },
  { id: "C2", label: "Bebidas C2", category: "Bebidas", slots: 4 },
  { id: "D1", label: "Snacks D1", category: "Snacks", slots: 4 },
];

export const templateProducts: Product[] = [
  { id: "p01", name: "Detergente Tal Tal 1kg", category: "Limpieza", price: 12.5, stock: 24, minStock: 8, shelf: "A1", slot: 0 },
  { id: "p02", name: "Lejía Clorox 1L", category: "Limpieza", price: 7.9, stock: 4, minStock: 6, shelf: "A1", slot: 1 },
  { id: "p03", name: "Jabón Bolívar x3", category: "Limpieza", price: 5.5, stock: 0, minStock: 5, shelf: "A1", slot: 2 },
  { id: "p04", name: "Esponja Scotch Brite", category: "Limpieza", price: 3.2, stock: 18, minStock: 6, shelf: "A1", slot: 3 },
  { id: "p05", name: "Papel Higiénico Elite x4", category: "Limpieza", price: 9.9, stock: 2, minStock: 10, shelf: "A2", slot: 0 },
  { id: "p06", name: "Suavitel 1L", category: "Limpieza", price: 14.9, stock: 11, minStock: 5, shelf: "A2", slot: 1 },
  { id: "p07", name: "Lavavajilla Sapolio", category: "Limpieza", price: 6.5, stock: 9, minStock: 5, shelf: "A2", slot: 2 },
  { id: "p08", name: "Limpiavidrios Vistony", category: "Limpieza", price: 8.0, stock: 15, minStock: 4, shelf: "A2", slot: 3 },
  { id: "p09", name: "Arroz Costeño 5kg", category: "Abarrotes", price: 28.0, stock: 32, minStock: 10, shelf: "B1", slot: 0 },
  { id: "p10", name: "Azúcar Rubia 1kg", category: "Abarrotes", price: 4.8, stock: 5, minStock: 12, shelf: "B1", slot: 1 },
  { id: "p11", name: "Aceite Primor 1L", category: "Abarrotes", price: 11.9, stock: 22, minStock: 8, shelf: "B1", slot: 2 },
  { id: "p12", name: "Fideos Don Vittorio", category: "Abarrotes", price: 3.9, stock: 1, minStock: 10, shelf: "B1", slot: 3 },
  { id: "p13", name: "Sal Marina 1kg", category: "Abarrotes", price: 2.5, stock: 40, minStock: 8, shelf: "B2", slot: 0 },
  { id: "p14", name: "Atún Florida", category: "Abarrotes", price: 5.9, stock: 14, minStock: 6, shelf: "B2", slot: 1 },
  { id: "p15", name: "Leche Gloria 400g", category: "Abarrotes", price: 4.2, stock: 0, minStock: 12, shelf: "B2", slot: 2 },
  { id: "p16", name: "Café Altomayo 200g", category: "Abarrotes", price: 16.5, stock: 7, minStock: 4, shelf: "B2", slot: 3 },
  { id: "p17", name: "Coca Cola 1.5L", category: "Bebidas", price: 7.5, stock: 28, minStock: 12, shelf: "C1", slot: 0 },
  { id: "p18", name: "Inca Kola 1.5L", category: "Bebidas", price: 7.5, stock: 9, minStock: 12, shelf: "C1", slot: 1 },
  { id: "p19", name: "Agua Cielo 2.5L", category: "Bebidas", price: 4.5, stock: 36, minStock: 10, shelf: "C1", slot: 2 },
  { id: "p20", name: "Cerveza Pilsen 6 pack", category: "Bebidas", price: 32.0, stock: 3, minStock: 6, shelf: "C1", slot: 3 },
  { id: "p21", name: "Frugos Durazno 1L", category: "Bebidas", price: 5.5, stock: 12, minStock: 6, shelf: "C2", slot: 0 },
  { id: "p22", name: "Red Bull Lata", category: "Bebidas", price: 8.9, stock: 0, minStock: 6, shelf: "C2", slot: 1 },
  { id: "p23", name: "Gatorade 500ml", category: "Bebidas", price: 4.5, stock: 19, minStock: 6, shelf: "C2", slot: 2 },
  { id: "p24", name: "Sporade Tropical", category: "Bebidas", price: 4.0, stock: 6, minStock: 6, shelf: "C2", slot: 3 },
  { id: "p25", name: "Galleta Oreo", category: "Snacks", price: 2.5, stock: 44, minStock: 10, shelf: "D1", slot: 0 },
  { id: "p26", name: "Chocolate Sublime", category: "Snacks", price: 3.5, stock: 8, minStock: 12, shelf: "D1", slot: 1 },
  { id: "p27", name: "Lays Clásicas", category: "Snacks", price: 4.9, stock: 21, minStock: 8, shelf: "D1", slot: 2 },
  { id: "p28", name: "Doritos Nacho", category: "Snacks", price: 4.9, stock: 2, minStock: 8, shelf: "D1", slot: 3 },
];

export function statusOf(p: Product): StockStatus {
  if (p.stock <= 0) return "empty";
  if (p.stock < p.minStock * 0.4) return "critical";
  if (p.stock < p.minStock) return "low";
  return "ok";
}

export const statusLabel: Record<StockStatus, string> = {
  ok: "En stock",
  low: "Stock bajo",
  critical: "Crítico",
  empty: "Agotado",
};
