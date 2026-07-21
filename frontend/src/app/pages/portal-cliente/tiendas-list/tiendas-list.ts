import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TiendasService } from '../../../core/services/tiendas.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tienda } from '../../../core/models/tienda.model';

@Component({
  selector: 'app-tiendas-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tiendas-list.html',
  styleUrl: './tiendas-list.scss'
})
export class TiendasListComponent implements OnInit {
  tiendas: any[] = []; // Usamos any para permitir el campo adicional 'rol_tienda' que viene de misTiendas
  loading: boolean = true;
  error: string = '';

  constructor(
    private tiendasService: TiendasService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarTiendas();
  }

  cargarTiendas() {
    this.loading = true;
    if (this.auth.isAuthenticated()) {
      this.tiendasService.misTiendas().subscribe({
        next: (data: any) => {
          this.tiendas = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar tus tiendas.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.tiendasService.listarTiendas().subscribe({
        next: (data: any) => {
          this.tiendas = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar las tiendas.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  entrarTienda(tienda: any) {
    // Todos, sean dueños o no, deben loguearse específicamente en la sucursal
    // para obtener su token de sesión especializado.
    this.router.navigate([`/tienda/${tienda.slug}/login`]);
  }
}
