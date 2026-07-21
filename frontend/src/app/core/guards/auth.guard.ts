import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    // Si la ruta requiere un store seleccionado y no lo hay, redirigir a seleccion
    if (route.data['requiresStore'] && !auth.currentStoreId()) {
      return router.parseUrl('/portal/tiendas'); // o donde se seleccione la tienda
    }
    return true;
  }

  return router.parseUrl('/login');
};
