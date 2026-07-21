import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(c => c.RegisterComponent) },
  
  // Login de Tienda (Empleados)
  { path: 'tienda/:slug/login', loadComponent: () => import('./pages/public-tienda/login-tienda/login-tienda').then(c => c.LoginTiendaComponent) },
  
  // Rutas Administrador
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(c => c.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['Administrador'], requiresStore: true },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/administrador/dashboard-admin/dashboard-admin').then(c => c.DashboardAdminComponent) },
      { path: 'anaqueles', loadComponent: () => import('./pages/administrador/gestionar-anaqueles/gestionar-anaqueles').then(c => c.GestionarAnaquelesComponent) },
      { path: 'productos', loadComponent: () => import('./pages/administrador/gestionar-productos/gestionar-productos').then(c => c.GestionarProductosComponent) },
      { path: 'buscar-productos', loadComponent: () => import('./pages/trabajador/anaqueles/anaqueles').then(c => c.AnaquelesTrabajadorComponent) },
      { path: 'inventario', loadComponent: () => import('./pages/trabajador/inventario/inventario').then(c => c.InventarioTrabajadorComponent) },
      { path: 'punto-de-venta', loadComponent: () => import('./pages/administrador/punto-de-venta/punto-de-venta').then(c => c.PuntoDeVentaComponent) },
      { path: 'reportes', loadComponent: () => import('./pages/administrador/reportes/reportes').then(c => c.ReportesComponent) },
      { path: 'alertas', loadComponent: () => import('./pages/administrador/alertas-stock/alertas-stock').then(c => c.AlertasStockComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/administrador/gestionar-usuarios/gestionar-usuarios').then(c => c.GestionarUsuariosComponent) },
      { path: 'ventas', loadComponent: () => import('./pages/administrador/ventas/ventas').then(c => c.VentasComponent) }
    ]
  },
  
  // Rutas Trabajador
  {
    path: 'trabajador',
    loadComponent: () => import('./layouts/trabajador-layout/trabajador-layout').then(c => c.TrabajadorLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRoles: ['Trabajador'], requiresStore: true },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/trabajador/dashboard-trabajador/dashboard-trabajador').then(c => c.DashboardTrabajadorComponent) },
      { path: 'anaqueles', loadComponent: () => import('./pages/trabajador/anaqueles/anaqueles').then(c => c.AnaquelesTrabajadorComponent) },
      { path: 'punto-de-venta', loadComponent: () => import('./pages/administrador/punto-de-venta/punto-de-venta').then(c => c.PuntoDeVentaComponent) },
      { path: 'ventas', loadComponent: () => import('./pages/administrador/ventas/ventas').then(c => c.VentasComponent) },
      { path: 'inventario', loadComponent: () => import('./pages/trabajador/inventario/inventario').then(c => c.InventarioTrabajadorComponent) }
    ]
  },

  // Portal Cliente
  {
    path: 'portal',
    loadComponent: () => import('./layouts/public-layout/public-layout').then(c => c.PublicLayoutComponent),
    children: [
      { path: '', redirectTo: 'tiendas', pathMatch: 'full' },
      { path: 'tiendas', loadComponent: () => import('./pages/portal-cliente/tiendas-list/tiendas-list').then(c => c.TiendasListComponent) },
      { path: 'nueva-tienda', loadComponent: () => import('./pages/portal-cliente/nueva-tienda/nueva-tienda').then(c => c.NuevaTiendaComponent), canActivate: [authGuard] },
      { path: 'tiendas/:slug', loadComponent: () => import('./pages/portal-cliente/tienda-detalle/tienda-detalle').then(c => c.TiendaDetalleComponent) }
    ]
  },
  
  { path: '**', redirectTo: 'login' }
];
