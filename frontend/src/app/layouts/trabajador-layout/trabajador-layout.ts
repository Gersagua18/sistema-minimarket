import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TiendasService } from '../../core/services/tiendas.service';
import { Tienda } from '../../core/models/tienda.model';


@Component({
  selector: 'app-trabajador-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trabajador-layout.html',
  styleUrl: './trabajador-layout.scss'
})
export class TrabajadorLayoutComponent implements OnInit {
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

    const rol = this.auth.currentUser()?.rol_tienda;
    this.menuItems = [
      { path: '/trabajador/dashboard', icon: 'bi-grid-1x2', label: 'Mi Resumen' }
    ];

    if (rol === 'Cajero') {
      this.menuItems.push(
        { path: '/trabajador/punto-de-venta', icon: 'bi-cart-check', label: 'Punto de Venta' },
        { path: '/trabajador/ventas', icon: 'bi-receipt', label: 'Registro de Ventas' },
        { path: '/trabajador/anaqueles', icon: 'bi-search', label: 'Buscar Productos' }
      );
    } else if (rol === 'Reposicion') {
      this.menuItems.push(
        { path: '/trabajador/inventario', icon: 'bi-upc-scan', label: 'Inventario / Restock' },
        { path: '/trabajador/anaqueles', icon: 'bi-search', label: 'Buscar Productos' }
      );
    } else {
      this.menuItems.push(
        { path: '/trabajador/punto-de-venta', icon: 'bi-cart-check', label: 'Punto de Venta' },
        { path: '/trabajador/ventas', icon: 'bi-receipt', label: 'Registro de Ventas' },
        { path: '/trabajador/inventario', icon: 'bi-upc-scan', label: 'Inventario / Restock' },
        { path: '/trabajador/anaqueles', icon: 'bi-search', label: 'Buscar Productos' }
      );
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
