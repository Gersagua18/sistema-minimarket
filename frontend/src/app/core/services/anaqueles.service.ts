import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Anaquel } from '../models/anaquel.model';
import { Producto } from '../models/producto.model';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnaquelesService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get apiUrl() {
    const id = this.auth.currentStoreId();
    return `${environment.apiUrl}/tiendas/${id}/anaqueles`;
  }

  listarAnaqueles(): Observable<Anaquel[]> {
    return this.http.get<ApiResponse<Anaquel[]>>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  productosDeAnaquel(idAnaquel: number): Observable<Producto[]> {
    return this.http.get<ApiResponse<Producto[]>>(`${this.apiUrl}/${idAnaquel}/productos`)
      .pipe(map(res => res.data));
  }

  crearAnaquel(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data)
      .pipe(map(res => res.data));
  }

  actualizarAnaquel(id: number, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data)
      .pipe(map(res => res.data));
  }
}
