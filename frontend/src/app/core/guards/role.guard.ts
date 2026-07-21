import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles: string[] = route.data['expectedRoles'];
  const user = auth.currentUser();

  if (!user) return router.parseUrl('/login');

  // Si tiene el rol del sistema esperado o el rol de tienda adecuado
  if (expectedRoles.includes(user.rol_nombre) || 
     (expectedRoles.includes('Administrador') && (user.rol_tienda === 'Administrador' || user.rol_tienda === 'Propietario'))) {
    return true;
  }

  // Redirigir según el rol que tenga
  if (user.rol_nombre === 'Administrador' || user.rol_tienda === 'Administrador' || user.rol_tienda === 'Propietario') {
    return router.parseUrl('/admin/dashboard');
  }
  if (user.rol_nombre === 'Trabajador') return router.parseUrl('/trabajador/dashboard');
  
  return router.parseUrl('/portal');
};
