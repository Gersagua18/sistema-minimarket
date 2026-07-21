import { Component, OnInit, TemplateRef, ViewChild , ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../../core/services/productos.service';
import { CategoriasService } from '../../../core/services/categorias.service';
import { AnaquelesService } from '../../../core/services/anaqueles.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-gestionar-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './gestionar-productos.html',
  styleUrl: './gestionar-productos.scss'
})
export class GestionarProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: any[] = [];
  anaqueles: any[] = [];
  
  loading = true;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  
  productForm: FormGroup;
  isEditing = false;
  currentProductId: number | null = null;
  private modalRef?: NgbModalRef;

  @ViewChild('productModal') productModal!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private anaquelesService: AnaquelesService,
    private modalService: NgbModal,
    private fb: FormBuilder
  , private cdr: ChangeDetectorRef) {
    this.productForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      id_categoria: ['', Validators.required],
      id_anaquel: ['', Validators.required],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [5, [Validators.required, Validators.min(0)]],
      estado: [true]
    });
  }

  ngOnInit() {
    this.cargarDatos();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.cargarDatos();
    });
  }

  cargarDatos() {
    this.loading = true;
    this.productosService.listarProductos(this.searchTerm).subscribe(prods => {
      this.productos = prods;
      this.loading = false; this.cdr.detectChanges();
    });
    this.categoriasService.listarCategorias().subscribe(cats => this.categorias = cats);
    this.anaquelesService.listarAnaqueles().subscribe(ans => this.anaqueles = ans);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.cargarDatos();
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  openAddModal() {
    this.isEditing = false;
    this.currentProductId = null;
    this.productForm.reset({ precio: 0, stock_actual: 0, stock_minimo: 5, estado: true });
    this.modalRef = this.modalService.open(this.productModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  openEditModal(prod: Producto) {
    this.isEditing = true;
    this.currentProductId = prod.id_producto;
    this.productForm.patchValue(prod);
    this.modalRef = this.modalService.open(this.productModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    
    if (this.isEditing && this.currentProductId) {
      this.productosService.actualizarProducto(this.currentProductId, this.productForm.value).subscribe(() => {
        this.modalRef?.close();
        this.cargarDatos();
      });
    } else {
      this.productosService.crearProducto(this.productForm.value).subscribe(() => {
        this.modalRef?.close();
        this.cargarDatos();
      });
    }
  }

  openDeleteModal(prod: Producto) {
    this.currentProductId = prod.id_producto;
    this.modalRef = this.modalService.open(this.deleteModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  confirmDelete() {
    if (this.currentProductId) {
      this.productosService.eliminarProducto(this.currentProductId).subscribe(() => {
        this.modalRef?.close();
        this.cargarDatos();
      });
    }
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


