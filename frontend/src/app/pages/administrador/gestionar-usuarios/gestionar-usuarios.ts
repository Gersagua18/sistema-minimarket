import { Component, OnInit, TemplateRef, ViewChild , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TiendasService } from '../../../core/services/tiendas.service';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-usuarios.html',
  styleUrl: './gestionar-usuarios.scss'
})
export class GestionarUsuariosComponent implements OnInit {
  trabajadores: any[] = [];
  loading = true;
  
  asignarForm: FormGroup;
  private modalRef?: NgbModalRef;

  @ViewChild('asignarModal') asignarModal!: TemplateRef<any>;

  constructor(
    private tiendasService: TiendasService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.asignarForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.\-\s]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol_tienda: ['Cajero', Validators.required],
      admin_password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.cargarTrabajadores();
  }

  cargarTrabajadores() {
    this.loading = true;
    this.tiendasService.listarTrabajadores().subscribe({
      next: (data: any) => {
        this.trabajadores = data;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false; this.cdr.detectChanges();
      }
    });
  }

  openAsignarModal() {
    this.asignarForm.reset({ rol_tienda: 'Cajero' });
    this.modalRef = this.modalService.open(this.asignarModal, { centered: true, backdropClass: 'glass-backdrop' });
  }

  crearEmpleado() {
    if (this.asignarForm.invalid) return;
    
    this.tiendasService.crearEmpleado(this.asignarForm.value).subscribe({
      next: () => {
        this.modalRef?.close();
        this.cargarTrabajadores();
      },
      error: (err: any) => {
        const errorMsg = err.error?.mensaje || err.error?.message || err.error?.error || err.message || 'Error desconocido';
        alert('Error al crear empleado: ' + errorMsg);
      }
    });
  }

  removerTrabajador(id_usuario: number) {
    if (confirm('¿Estás seguro de remover a este trabajador de tu tienda? Perderá acceso.')) {
      const admin_password = prompt('Por seguridad, ingresa tu contraseña de administrador:');
      if (!admin_password) return;
      
      this.tiendasService.removerTrabajador(id_usuario, admin_password).subscribe({
        next: () => {
          this.cargarTrabajadores();
        },
        error: (err: any) => {
          const errorMsg = err.error?.mensaje || err.error?.message || err.error?.error || err.message || 'Error desconocido';
          alert('Error: ' + errorMsg);
        }
      });
    }
  }
}


