import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Tienda } from '../models/tienda.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TiendasService {
  private apiUrl = `${environment.apiUrl}/tiendas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  listarTiendas(): Observable<Tienda[]> {
    return this.http.get<ApiResponse<Tienda[]>>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  misTiendas(): Observable<Tienda[]> {
    return this.http.get<ApiResponse<Tienda[]>>(`${this.apiUrl}/mis-tiendas`)
      .pipe(map(res => res.data));
  }

  crearTienda(payload: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload)
      .pipe(map(res => res.data));
  }

  obtenerTienda(id: number): Observable<Tienda> {
    return this.http.get<ApiResponse<Tienda>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  obtenerPorSlug(slug: string): Observable<Tienda> {
    return this.http.get<ApiResponse<Tienda>>(`${this.apiUrl}/slug/${slug}`)
      .pipe(map(res => res.data));
  }

  listarTrabajadores(): Observable<any[]> {
    const id = this.auth.currentStoreId();
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${id}/usuarios`)
      .pipe(map(res => res.data));
  }

  asignarTrabajador(email: string, rol_tienda: string): Observable<any> {
    const id = this.auth.currentStoreId();
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/usuarios`, { email, rol_tienda })
      .pipe(map(res => res.data));
  }

  removerTrabajador(id_usuario: number, admin_password?: string): Observable<any> {
    const id = this.auth.currentStoreId();
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/usuarios/${id_usuario}`, {
      body: { admin_password }
    }).pipe(map(res => res.data));
  }

  crearEmpleado(payload: any): Observable<any> {
    const id = this.auth.currentStoreId();
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/usuarios/crear-empleado`, payload)
      .pipe(map(res => res.data));
  }
}
