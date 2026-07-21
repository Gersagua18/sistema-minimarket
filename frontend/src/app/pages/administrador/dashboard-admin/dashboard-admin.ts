import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdminComponent implements OnInit {
  data: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading = true;
    this.dashboardService.dashboardAdmin().subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false; this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'No se pudo cargar la información del dashboard.';
        this.loading = false; this.cdr.detectChanges();
      }
    });
  }

  get maxVentasSemana(): number {
    if (!this.data?.ventas_7_dias) return 0;
    return Math.max(...this.data.ventas_7_dias.map((v:any) => Number(v.total_ventas))) || 1;
  }
}

