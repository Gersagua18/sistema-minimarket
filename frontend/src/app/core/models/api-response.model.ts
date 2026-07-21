export interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  data: T;
}
