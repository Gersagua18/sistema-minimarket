import { Component , ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss'
})
export class ReportesComponent {
  fechaInicio: string = '';
  fechaFin: string = '';
  
  reporteData: any = null;
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {
    // Valores por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = hace30Dias.toISOString().split('T')[0];
  }

  generarReporte() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.error = 'Debes seleccionar ambas fechas.';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.dashboardService.obtenerReporteVentas(this.fechaInicio, this.fechaFin).subscribe({
      next: (res: any) => {
        this.reporteData = res;
        this.loading = false; this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error al generar el reporte: ' + err;
        this.loading = false; this.cdr.detectChanges();
      }
    });
  }

  exportarCSV() {
    if (!this.reporteData?.ventas_por_dia) return;
    
    let csv = 'Fecha,Total Ventas (S/),Cantidad Boletas\n';
    this.reporteData.ventas_por_dia.forEach((row: any) => {
      csv += `${row.fecha},${row.total_dia},${row.cantidad_boletas}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${this.fechaInicio}_${this.fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}


