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
export class ProductosService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/productos`;
  }

  listarProductos(search?: string, categoria?: string): Observable<Producto[]> {
    let params: any = {};
    if (search) params.search = search;
    if (categoria) params.categoria = categoria;
    
    return this.http.get<ApiResponse<Producto[]>>(this.apiUrl, { params })
      .pipe(map(res => res.data));
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<ApiResponse<Producto>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  crearProducto(data: any): Observable<Producto> {
    return this.http.post<ApiResponse<Producto>>(this.apiUrl, data)
      .pipe(map(res => res.data));
  }

  actualizarProducto(id: number, data: any): Observable<Producto> {
    return this.http.put<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, data)
      .pipe(map(res => res.data));
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  moverAnaquel(idProducto: number, idAnaquel: number): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${idProducto}/mover`, { id_anaquel: idAnaquel })
      .pipe(map(res => res.data));
  }
}
