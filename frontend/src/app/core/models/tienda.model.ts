export interface Tienda {
  id_tienda: number;
  nombre: string;
  slug: string;
  direccion: string;
  telefono?: string;
  logo_url?: string;
  descripcion?: string;
  estado: boolean;
  total_usuarios?: number;
  total_anaqueles?: number;
  total_productos?: number;
}
