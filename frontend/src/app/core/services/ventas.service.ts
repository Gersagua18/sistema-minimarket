import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Venta } from '../models/venta.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/ventas`;
  }

  registrarVenta(items: any[], metodoPago: string = 'Efectivo'): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, { items, metodo_pago: metodoPago })
      .pipe(map(res => res.data));
  }

  listarVentas(limit = 50, offset = 0): Observable<Venta[]> {
    return this.http.get<ApiResponse<Venta[]>>(this.apiUrl, { params: { limit, offset } })
      .pipe(map(res => res.data));
  }

  ventasHoy(): Observable<Venta[]> {
    return this.http.get<ApiResponse<Venta[]>>(`${this.apiUrl}/hoy`)
      .pipe(map(res => res.data));
  }

  obtenerDetalle(id: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }
}
