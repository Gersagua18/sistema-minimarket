import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login-tienda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-tienda.html',
  styleUrl: './login-tienda.scss'
})
export class LoginTiendaComponent implements OnInit {
  loginForm: FormGroup;
  slug: string = '';
  loading = false;
  error = '';
  storeName = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      // Capitalizar slug simple para mostrar
      if (this.slug) {
        this.storeName = this.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid || !this.slug) return;

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.auth.loginTienda(this.slug, email, password).subscribe({
      next: (success) => {
        if (success) {
          const user = this.auth.currentUser();
          const targetRoute = (user?.rol_tienda === 'Propietario' || user?.rol_tienda === 'Administrador') 
                              ? '/admin/dashboard' 
                              : '/trabajador/dashboard';
          
          this.router.navigate([targetRoute]).then(navigated => {
            if (!navigated) {
              this.loading = false;
              this.error = 'No se pudo acceder al panel. Verifica tus permisos.';
              this.cdr.detectChanges();
            }
          }).catch(err => {
            this.loading = false;
            this.error = 'Error de navegación.';
            this.cdr.detectChanges();
          });
        } else {
          this.loading = false;
          this.error = 'No se pudo iniciar sesión. Verifica tus datos.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = typeof err === 'string' ? err : 'Credenciales incorrectas o sin acceso a esta sucursal';
        this.cdr.detectChanges();
      }
    });
  }
}
