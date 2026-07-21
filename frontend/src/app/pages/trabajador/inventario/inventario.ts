import { Component, OnInit, TemplateRef, ViewChild , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../../core/services/productos.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-inventario-trabajador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss'
})
export class InventarioTrabajadorComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  searchTerm = '';
  
  restockForm: FormGroup;
  currentProducto: Producto | null = null;
  private modalRef?: NgbModalRef;

  @ViewChild('restockModal') restockModal!: TemplateRef<any>;

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService,
    private modalService: NgbModal,
    private fb: FormBuilder
  , private cdr: ChangeDetectorRef) {
    this.restockForm = this.fb.group({
      tipo: ['entrada', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      observacion: ['']
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(event?: any) {
    if (event) this.searchTerm = event.target.value;
    
    this.loading = true;
    this.productosService.listarProductos(this.searchTerm).subscribe(prods => {
      this.productos = prods;
      this.loading = false; this.cdr.detectChanges();
    });
  }

  openRestockModal(prod: Producto) {
    this.currentProducto = prod;
    this.restockForm.reset({ tipo: 'entrada', cantidad: 1, observacion: '' });
    this.modalRef = this.modalService.open(this.restockModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  confirmarRestock() {
    if (this.restockForm.invalid || !this.currentProducto) return;
    
    const vals = this.restockForm.value;
    const qty = vals.tipo === 'entrada' ? vals.cantidad : -vals.cantidad;
    
    this.inventarioService.restock(this.currentProducto.id_producto, qty, vals.observacion).subscribe({
      next: () => {
        this.modalRef?.close();
        this.cargarDatos(); // Recargar la tabla para ver el nuevo stock
      },
      error: (err: any) => {
        alert('Error al registrar movimiento: ' + err);
      }
    });
  }

  getStockClass(actual: number, minimo: number): string {
    if (actual === 0) return 'badge-stock-empty';
    if (actual < minimo * 0.4) return 'badge-stock-critical';
    if (actual < minimo) return 'badge-stock-low';
    return 'badge-stock-ok';
  }

  getStockLabel(actual: number, minimo: number): string {
    if (actual === 0) return 'Agotado';
    if (actual < minimo * 0.4) return 'Crítico';
    if (actual < minimo) return 'Bajo';
    return 'Óptimo';
  }
}


