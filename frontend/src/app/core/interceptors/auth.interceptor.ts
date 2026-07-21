import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('token');
  }
  
  const injector = inject(Injector);
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/login') && !req.url.includes('/logout')) {
        const authService = injector.get(AuthService);
        const router = injector.get(Router);
        
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }
      return throwError(() => err);
    })
  );
};
