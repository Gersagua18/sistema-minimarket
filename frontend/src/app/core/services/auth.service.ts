import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface UserInfo {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  id_rol: number;
  rol_nombre: string;
  id_tienda?: number;
  rol_tienda?: string;
  tienda_slug?: string;
  tienda_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Usamos signals para manejar el estado del usuario de forma reactiva
  public currentUser = signal<UserInfo | null>(null);
  public isAuthenticated = signal<boolean>(false);
  public isStaff = signal<boolean>(false); // Si es admin o trabajador
  
  // Guardamos el ID de la tienda actual
  public currentStoreId = signal<number | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  private checkToken() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const storeIdStr = localStorage.getItem('current_store_id');
    
    if (token && userStr) {
      const user = JSON.parse(userStr) as UserInfo;
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.isStaff.set(user.rol_nombre === 'Administrador' || user.rol_nombre === 'Trabajador');
      
      if (storeIdStr) {
        this.currentStoreId.set(Number(storeIdStr));
      }
    }
  }

  login(email: string, password: string):Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        if(res.ok) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.usuario));
          }
          this.currentUser.set(res.data.usuario);
          this.isAuthenticated.set(true);
          this.isStaff.set(res.data.usuario.rol_nombre === 'Administrador' || res.data.usuario.rol_nombre === 'Trabajador');
          return true;
        }
        return false;
      }),
      catchError(err => throwError(() => err.error?.mensaje || 'Error en login'))
    );
  }

  loginTienda(slug: string, email: string, password: string):Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/tienda/login`, { slug, email, password }).pipe(
      map(res => {
        if(res.ok) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.usuario));
            localStorage.setItem('current_store_id', res.data.usuario.id_tienda);
          }
          this.currentUser.set(res.data.usuario);
          this.isAuthenticated.set(true);
          this.isStaff.set(true); // En tienda siempre es staff (Admin, Cajero, etc)
          this.currentStoreId.set(res.data.usuario.id_tienda);
          return true;
        }
        return false;
      }),
      catchError(err => throwError(() => err.error?.message || err.error?.error || 'Error en login de tienda'))
    );
  }

  register(data: any):Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, data).pipe(
      map(res => res.ok),
      catchError(err => throwError(() => err.error?.mensaje || 'Error en registro'))
    );
  }

  logout():Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      }),
      map(res => res.ok),
      catchError(err => {
        this.clearSession();
        this.router.navigate(['/login']);
        return of(true);
      })
    );
  }

  setStore(storeId: number) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('current_store_id', storeId.toString());
    }
    this.currentStoreId.set(storeId);
  }

  private clearSession() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('current_store_id');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isStaff.set(false);
    this.currentStoreId.set(null);
  }
}
