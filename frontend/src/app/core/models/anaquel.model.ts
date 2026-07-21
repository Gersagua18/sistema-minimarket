export interface Anaquel {
  id_anaquel: number;
  codigo: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  estado: boolean;
  id_tienda: number;
  total_productos?: number;
}
