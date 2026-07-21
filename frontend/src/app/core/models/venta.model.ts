export interface DetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id_venta: number;
  id_cliente?: number;
  id_trabajador: number;
  trabajador?: string;
  fecha: string;
  total: number;
  metodo_pago: string;
  estado: string;
  id_tienda: number;
  boleta_numero?: string;
  detalles?: DetalleVenta[];
}
