import { Component, OnInit, TemplateRef, ViewChild , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AnaquelesService } from '../../../core/services/anaqueles.service';

@Component({
  selector: 'app-gestionar-anaqueles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-anaqueles.html',
  styleUrl: './gestionar-anaqueles.scss'
})
export class GestionarAnaquelesComponent implements OnInit {
  anaqueles: any[] = [];
  loading = true;
  
  anaquelForm: FormGroup;
  isEditing = false;
  currentAnaquelId: number | null = null;
  private modalRef?: NgbModalRef;

  @ViewChild('anaquelModal') anaquelModal!: TemplateRef<any>;

  constructor(
    private anaquelesService: AnaquelesService,
    private modalService: NgbModal,
    private fb: FormBuilder
  , private cdr: ChangeDetectorRef) {
    this.anaquelForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.anaquelesService.listarAnaqueles().subscribe(ans => {
      this.anaqueles = ans;
      this.loading = false; this.cdr.detectChanges();
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentAnaquelId = null;
    this.anaquelForm.reset();
    this.modalRef = this.modalService.open(this.anaquelModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  openEditModal(anaquel: any) {
    this.isEditing = true;
    this.currentAnaquelId = anaquel.id_anaquel;
    this.anaquelForm.patchValue(anaquel);
    this.modalRef = this.modalService.open(this.anaquelModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  saveAnaquel() {
    if (this.anaquelForm.invalid) return;
    
    if (this.isEditing && this.currentAnaquelId) {
      this.anaquelesService.actualizarAnaquel(this.currentAnaquelId, this.anaquelForm.value).subscribe(() => {
        this.modalRef?.close();
        this.cargarDatos();
      });
    } else {
      this.anaquelesService.crearAnaquel(this.anaquelForm.value).subscribe(() => {
        this.modalRef?.close();
        this.cargarDatos();
      });
    }
  }
}


