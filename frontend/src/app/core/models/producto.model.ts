export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  precio: number;
  id_categoria: number;
  categoria?: string;
  id_anaquel: number;
  anaquel_codigo?: string;
  anaquel_nombre?: string;
  stock_actual: number;
  stock_minimo: number;
  estado: boolean;
  id_tienda: number;
  fecha_creacion: string;
  updated_at?: string;
}
