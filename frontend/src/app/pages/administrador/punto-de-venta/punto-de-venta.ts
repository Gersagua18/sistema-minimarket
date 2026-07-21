import { Component, OnInit, TemplateRef, ViewChild , ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../../core/services/productos.service';
import { VentasService } from '../../../core/services/ventas.service';
import { AuthService } from '../../../core/services/auth.service';
import { TiendasService } from '../../../core/services/tiendas.service';
import { Producto } from '../../../core/models/producto.model';

interface CartItem extends Producto {
  cantidad_venta: number;
  subtotal: number;
}

@Component({
  selector: 'app-punto-de-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './punto-de-venta.html',
  styleUrl: './punto-de-venta.scss'
})
export class PuntoDeVentaComponent implements OnInit {
  productos: Producto[] = [];
  carrito: CartItem[] = [];
  searchTerm = '';
  private searchTimeout: any;
  
  metodoPago = 'Efectivo';
  total = 0;
  subtotal = 0;
  igv = 0;

  loading = false;
  ventaExitosa: any = null;
  tiendaActual: any = null;

  @ViewChild('boletaModal') boletaModal!: TemplateRef<any>;

  constructor(
    private productosService: ProductosService,
    private ventasService: VentasService,
    public auth: AuthService,
    private tiendasService: TiendasService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buscarProductos();
    this.cargarTienda();
  }

  cargarTienda() {
    const id = this.auth.currentStoreId();
    if (id) {
      this.tiendasService.obtenerTienda(id).subscribe(t => {
        this.tiendaActual = t;
        this.cdr.detectChanges();
      });
    }
  }

  buscarProductos(event?: any) {
    if (event) {
      this.searchTerm = event.target.value;
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.ejecutarBusqueda();
      }, 300);
    } else {
      this.ejecutarBusqueda();
    }
  }

  private ejecutarBusqueda() {
    this.productosService.listarProductos(this.searchTerm).subscribe(prods => {
      this.productos = prods.filter(p => p.estado && p.stock_actual > 0);
      this.cdr.detectChanges();
    });
  }

  agregarAlCarrito(prod: Producto) {
    const existe = this.carrito.find(item => item.id_producto === prod.id_producto);
    const precio = Number(prod.precio);
    
    if (existe) {
      if (existe.cantidad_venta < prod.stock_actual) {
        existe.cantidad_venta++;
        existe.subtotal = existe.cantidad_venta * precio;
      }
    } else {
      this.carrito.push({
        ...prod,
        precio: precio,
        cantidad_venta: 1,
        subtotal: precio
      });
    }
    this.calcularTotales();
  }

  cambiarCantidad(item: CartItem, delta: number) {
    const nuevaCant = item.cantidad_venta + delta;
    if (nuevaCant > 0 && nuevaCant <= item.stock_actual) {
      item.cantidad_venta = nuevaCant;
      item.subtotal = item.cantidad_venta * Number(item.precio);
    } else if (nuevaCant === 0) {
      this.eliminarDelCarrito(item);
    }
    this.calcularTotales();
  }

  eliminarDelCarrito(item: CartItem) {
    this.carrito = this.carrito.filter(i => i.id_producto !== item.id_producto);
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
    this.igv = this.subtotal * 0.18;
    this.total = this.subtotal + this.igv;
  }

  setMetodoPago(metodo: string) {
    this.metodoPago = metodo;
  }

  procesarVenta() {
    if (this.carrito.length === 0) return;
    
    this.loading = true;
    const items = this.carrito.map(c => ({
      id_producto: c.id_producto,
      cantidad: c.cantidad_venta,
      precio_unitario: c.precio
    }));

    this.ventasService.registrarVenta(items, this.metodoPago).subscribe({
      next: (res: any) => {
        this.loading = false; this.cdr.detectChanges();
        this.ventaExitosa = res;
        this.modalService.open(this.boletaModal, { centered: true, backdropClass: 'glass-backdrop', size: 'sm' });
        this.limpiarCaja();
      },
      error: (err: any) => {
        this.loading = false; this.cdr.detectChanges();
        alert('Error al procesar venta: ' + err);
      }
    });
  }

  limpiarCaja() {
    this.carrito = [];
    this.calcularTotales();
    this.buscarProductos(); // Recargar stock actualizado
    this.searchTerm = '';
  }
}


