import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VentasService } from '../../../core/services/ventas.service';
import { TiendasService } from '../../../core/services/tiendas.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ventas-lista',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
<div class="animate-fade-in pb-4 h-100 d-flex flex-column">
  
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="font-display fw-bold text-dark mb-1">Registro de Ventas</h2>
      <p class="text-muted mb-0">Historial completo de boletas y transacciones.</p>
    </div>
  </div>

  <div *ngIf="loading" class="flex-grow-1 d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <div class="card shadow-sm border-0 rounded-4 overflow-hidden h-100 d-flex flex-column" *ngIf="!loading">
    <div class="table-responsive flex-grow-1">
      <table class="table table-hover align-middle mb-0 text-dark">
        <thead class="bg-light sticky-top text-muted small text-uppercase tracking-wider">
          <tr>
            <th class="py-3 px-4 fw-medium border-bottom">ID Venta</th>
            <th class="py-3 px-4 fw-medium border-bottom">Fecha</th>
            <th class="py-3 px-4 fw-medium border-bottom">Cajero</th>
            <th class="py-3 px-4 fw-medium border-bottom text-center">Método</th>
            <th class="py-3 px-4 fw-medium border-bottom text-end">Total</th>
            <th class="py-3 px-4 fw-medium border-bottom text-center">Boleta</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of ventas" class="cursor-pointer" (click)="verDetalle(v)">
            <td class="px-4 py-3 fw-bold">#{{ v.id_venta }}</td>
            <td class="px-4 py-3">{{ v.fecha | date:'medium' }}</td>
            <td class="px-4 py-3 text-truncate" style="max-width: 150px;">{{ v.trabajador || v.id_trabajador }}</td>
            <td class="px-4 py-3 text-center">
              <span class="badge" [ngClass]="v.metodo_pago === 'Yape' ? 'bg-primary' : 'bg-success'">{{ v.metodo_pago }}</span>
            </td>
            <td class="px-4 py-3 text-end fw-bold text-success">{{ v.total | currency:'S/ ' }}</td>
            <td class="px-4 py-3 text-center">
              <button class="btn btn-sm btn-outline-secondary rounded-pill" (click)="$event.stopPropagation(); verDetalle(v)">Ver Ticket</button>
            </td>
          </tr>
          <tr *ngIf="ventas.length === 0">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-receipt fs-1 d-block mb-2 opacity-50"></i>
              No hay ventas registradas aún.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Boleta -->
<ng-template #boletaModal let-modal>
  <div class="modal-content bg-light text-dark border-0 rounded-0" style="font-family: 'Courier New', Courier, monospace;">
    <div class="modal-body p-4 text-center">
      
      <div class="mb-3 text-center">
        <i class="bi bi-shop fs-1"></i>
        <div class="small text-muted mb-1 mt-2">MercaLink</div>
        <h4 class="fw-bold text-uppercase mb-0">{{ tiendaActual?.nombre || 'Mi Tienda' }}</h4>
        <div class="small">RUC: 20123456789</div>
        <div class="small mb-3">Ticket Electrónico (Copia)</div>
        
        <div class="fw-bold fs-5 border-top border-bottom border-dark py-2 mb-3">
          {{ ventaSeleccionada?.boleta_numero || ('BOL-' + ventaSeleccionada?.id_venta?.toString()?.padStart(6, '0')) }}
        </div>
      </div>

      <div class="text-start mb-3 small">
        <div><strong>Fecha:</strong> {{ ventaSeleccionada?.fecha | date:'short' }}</div>
        <div><strong>Cajero:</strong> {{ ventaSeleccionada?.trabajador || ventaSeleccionada?.id_trabajador }}</div>
        <div><strong>Tipo de Pago:</strong> {{ ventaSeleccionada?.metodo_pago }}</div>
      </div>

      <table class="table table-sm table-borderless small mb-3">
        <thead class="border-top border-bottom border-dark">
          <tr>
            <th class="text-start py-1">CANT DESCRIPCION</th>
            <th class="text-end py-1">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of detalleVenta">
            <td class="text-start py-1">
              <div>{{ item.cantidad }}x {{ item.producto_nombre || 'Producto' }}</div>
            </td>
            <td class="text-end py-1">
              {{ (item.cantidad * item.precio_unitario).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="border-top border-dark pt-2 text-end small">
        <div class="d-flex justify-content-between mb-1">
          <span>SUBTOTAL:</span>
          <span>S/ {{ (ventaSeleccionada?.total / 1.18).toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-content-between mb-1">
          <span>IGV (18%):</span>
          <span>S/ {{ (ventaSeleccionada?.total - (ventaSeleccionada?.total / 1.18)).toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold fs-6 mt-2">
          <span>TOTAL:</span>
          <span>S/ {{ Number(ventaSeleccionada?.total).toFixed(2) }}</span>
        </div>
      </div>

      <div class="text-center mt-4 small">
        <p class="mb-0">Copia de Registro</p>
      </div>

    </div>
    
    <div class="modal-footer border-0 bg-white p-2 text-center d-flex justify-content-center">
      <button type="button" class="btn btn-outline-secondary btn-sm rounded-0" (click)="modal.close()">Cerrar</button>
    </div>
  </div>
</ng-template>
  `
})
export class VentasComponent implements OnInit {
  ventas: any[] = [];
  loading = false;
  tiendaActual: any = null;
  
  ventaSeleccionada: any = null;
  detalleVenta: any[] = [];
  Number = Number; // For template usage

  @ViewChild('boletaModal') boletaModal!: TemplateRef<any>;

  constructor(
    private ventasService: VentasService,
    private tiendasService: TiendasService,
    private auth: AuthService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarTienda();
  }

  cargarTienda() {
    const id = this.auth.currentStoreId();
    if (id) {
      this.tiendasService.obtenerTienda(id).subscribe(t => {
        this.tiendaActual = t;
      });
    }
  }

  cargarVentas() {
    this.loading = true;
    this.ventasService.listarVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(venta: any) {
    this.ventaSeleccionada = venta;
    this.detalleVenta = [];
    
    this.ventasService.obtenerDetalle(venta.id_venta).subscribe({
      next: (detalle) => {
        this.detalleVenta = detalle;
        this.modalService.open(this.boletaModal, { centered: true, backdropClass: 'glass-backdrop', size: 'sm' });
      },
      error: (err) => {
        alert('Error al cargar detalle');
      }
    });
  }
}
