import { Component , ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  , private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      
      const { email, password } = this.loginForm.value;
      
      this.auth.login(email, password).subscribe({
        next: () => {
          const user = this.auth.currentUser();
          if (user?.rol_nombre === 'Administrador') {
            this.router.navigate(['/portal/tiendas']); // o a elegir tienda
          } else if (user?.rol_nombre === 'Trabajador') {
            this.router.navigate(['/portal/tiendas']);
          } else {
            this.router.navigate(['/portal/tiendas']);
          }
        },
        error: (err: any) => {
          this.error = err;
          this.loading = false; this.cdr.detectChanges();
        }
      });
    }
  }
}


