export interface UsuarioTienda {
  id: number;
  id_tienda: number;
  id_usuario: number;
  rol_tienda: string;
  activo: boolean;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol_sistema: string;
}
