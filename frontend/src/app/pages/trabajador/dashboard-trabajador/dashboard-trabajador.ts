import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-trabajador',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './dashboard-trabajador.html',
  styleUrl: './dashboard-trabajador.scss'
})
export class DashboardTrabajadorComponent implements OnInit {
  data: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.loading = true;
    this.dashboardService.dashboardTrabajador().subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false; this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'No se pudo cargar tu resumen.';
        this.loading = false; this.cdr.detectChanges();
      }
    });
  }
}

