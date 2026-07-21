import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnaquelesService } from '../../../core/services/anaqueles.service';
import { ProductosService } from '../../../core/services/productos.service';

@Component({
  selector: 'app-anaqueles-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anaqueles.html',
  styleUrl: './anaqueles.scss'
})
export class AnaquelesTrabajadorComponent implements OnInit {
  anaqueles: any[] = [];
  productos: any[] = [];
  
  loadingAnaqueles = true;
  loadingProductos = false;
  
  searchTerm = '';
  selectedAnaquelId: number | null = null;

  constructor(
    private anaquelesService: AnaquelesService,
    private productosService: ProductosService
  , private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarAnaqueles();
    this.buscarProductos();
  }

  cargarAnaqueles() {
    this.loadingAnaqueles = true;
    this.anaquelesService.listarAnaqueles().subscribe({
      next: (ans) => {
        this.anaqueles = ans;
        this.loadingAnaqueles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingAnaqueles = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscarProductos() {
    this.loadingProductos = true;
    this.cdr.detectChanges();
    this.productosService.listarProductos(this.searchTerm).subscribe({
      next: (prods) => {
        if (this.selectedAnaquelId) {
          this.productos = prods.filter(p => p.id_anaquel === this.selectedAnaquelId);
        } else {
          this.productos = prods;
        }
        this.loadingProductos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.buscarProductos();
  }

  filtrarPorAnaquel(id: number | null) {
    this.selectedAnaquelId = id;
    this.buscarProductos();
  }
}

