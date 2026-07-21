import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/dashboard`;
  }

  dashboardAdmin(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin`)
      .pipe(map(res => res.data));
  }

  dashboardTrabajador(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/trabajador`)
      .pipe(map(res => res.data));
  }

  reporteInventario(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reportes/inventario`)
      .pipe(map(res => res.data));
  }

  obtenerReporteVentas(inicio: string, fin: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reportes/ventas`, {
      params: { inicio, fin }
    }).pipe(map(res => res.data));
  }
}
