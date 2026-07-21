import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Producto } from '../models/producto.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/inventario`;
  }

  restock(idProducto: number, cantidad: number, observacion?: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/productos/${idProducto}/restock`, { cantidad, observacion })
      .pipe(map(res => res.data));
  }

  alertasStock(): Observable<Producto[]> {
    return this.http.get<ApiResponse<Producto[]>>(`${this.apiUrl}/alertas`)
      .pipe(map(res => res.data));
  }
}
