import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventarioService } from '../../../core/services/inventario.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-stock.html',
  styleUrl: './alertas-stock.scss'
})
export class AlertasStockComponent implements OnInit {
  alertas: Producto[] = [];
  loading = true;

  constructor(private inventarioService: InventarioService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.loading = true;
    this.inventarioService.alertasStock().subscribe(res => {
      this.alertas = res;
      this.loading = false; this.cdr.detectChanges();
    });
  }

  getEstado(actual: number, minimo: number): string {
    if (actual === 0) return 'empty';
    if (actual < minimo * 0.4) return 'critical';
    return 'low';
  }
}

