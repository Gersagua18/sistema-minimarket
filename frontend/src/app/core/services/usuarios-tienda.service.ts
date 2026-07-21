import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UsuarioTienda } from '../models/usuario-tienda.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosTiendaService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/usuarios`;
  }

  listarUsuarios(): Observable<UsuarioTienda[]> {
    return this.http.get<ApiResponse<UsuarioTienda[]>>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  agregarUsuario(email: string, rol_tienda: string, admin_password: string): Observable<UsuarioTienda> {
    return this.http.post<ApiResponse<UsuarioTienda>>(this.apiUrl, { email, rol_tienda, admin_password })
      .pipe(map(res => res.data));
  }

  eliminarUsuario(idUsuarioTienda: number, admin_password: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idUsuarioTienda}`, { body: { admin_password } })
      .pipe(map(res => res.data));
  }
}
