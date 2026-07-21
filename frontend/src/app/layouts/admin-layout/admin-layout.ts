import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TiendasService } from '../../core/services/tiendas.service';
import { Tienda } from '../../core/models/tienda.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  tiendaActual: Tienda | null = null;
  
  menuItems: any[] = [];

  constructor(
    public auth: AuthService,
    private tiendasService: TiendasService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.auth.currentStoreId();
    if (id) {
      this.tiendasService.obtenerTienda(id).subscribe(t => this.tiendaActual = t);
    }
    
    this.construirMenu();
  }

  construirMenu() {
    const user = this.auth.currentUser();
    const rol = user?.rol_tienda || user?.rol_nombre;

    if (rol === 'Propietario') {
      this.menuItems = [
        { path: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
        { path: '/admin/punto-de-venta', icon: 'bi-cart-check', label: 'Punto de Venta' },
        { path: '/admin/ventas', icon: 'bi-receipt', label: 'Ventas' },
        { path: '/admin/buscar-productos', icon: 'bi-search', label: 'Buscar Productos' },
        { path: '/admin/inventario', icon: 'bi-upc-scan', label: 'Inventario / Restock' },
        { path: '/admin/productos', icon: 'bi-box-seam', label: 'Productos' },
        { path: '/admin/anaqueles', icon: 'bi-bookshelf', label: 'Anaqueles' },
        { path: '/admin/reportes', icon: 'bi-graph-up-arrow', label: 'Reportes' },
        { path: '/admin/alertas', icon: 'bi-exclamation-triangle', label: 'Alertas de Stock' },
        { path: '/admin/usuarios', icon: 'bi-people', label: 'Personal' }
      ];
    } else {
      // Para el 'Trabajador Admin' (rol_tienda === 'Administrador')
      this.menuItems = [
        { path: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
        { path: '/admin/buscar-productos', icon: 'bi-search', label: 'Buscar Productos' },
        { path: '/admin/productos', icon: 'bi-box-seam', label: 'Productos' },
        { path: '/admin/anaqueles', icon: 'bi-bookshelf', label: 'Anaqueles' },
        { path: '/admin/inventario', icon: 'bi-upc-scan', label: 'Inventario / Restock' },
        { path: '/admin/reportes', icon: 'bi-graph-up-arrow', label: 'Reportes' },
        { path: '/admin/alertas', icon: 'bi-exclamation-triangle', label: 'Alertas de Stock' }
      ];
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  cambiarTienda() {
    this.router.navigate(['/portal/tiendas']);
  }
}
