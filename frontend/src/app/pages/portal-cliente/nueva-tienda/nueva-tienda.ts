import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TiendasService } from '../../../core/services/tiendas.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nueva-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-tienda.html',
  styles: [`
    .font-display { font-family: 'Outfit', sans-serif; }
    .bg-background { background-color: var(--background, #FCF8F4); }
    .bg-card { background-color: var(--card, #ffffff); }
  `]
})
export class NuevaTiendaComponent implements OnInit {
  step = 0;
  steps = ["Ubicación de la tienda", "Credenciales de acceso", "Anaqueles", "Productos", "Confirmación"];
  
  info = { name: '', address: '', city: '', region: '' };
  creds = { adminUsername: '', adminName: '', adminPassword: '', adminPassword2: '' };
  
  shelves = [
    { id: 'N1', label: 'Estante Principal', slots: 4 },
    { id: 'N2', label: 'Refrigerador', slots: 3 },
    { id: 'N3', label: 'Snacks', slots: 4 },
    { id: 'N4', label: 'Bebidas', slots: 3 }
  ];
  
  seedTemplate = true;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private tiendasService: TiendasService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.creds.adminName = `${user.nombre} ${user.apellido}`;
      this.creds.adminUsername = user.email;
    }
  }

  cancelar() {
    this.router.navigate(['/portal/tiendas']);
  }

  atras() {
    if (this.step === 0) {
      this.cancelar();
    } else {
      this.step--;
      this.error = '';
    }
  }

  siguiente() {
    if (this.canProceed()) {
      this.step++;
      this.error = '';
    }
  }

  canProceed(): boolean {
    if (this.step === 0) {
      return !!(this.info.name.trim() && this.info.address.trim() && this.info.city.trim() && this.info.region.trim());
    }
    if (this.step === 1) {
      return !!(
        this.creds.adminUsername.trim().length >= 3 &&
        this.creds.adminName.trim().length >= 2 &&
        this.creds.adminPassword.length >= 4 &&
        this.creds.adminPassword === this.creds.adminPassword2
      );
    }
    if (this.step === 2) {
      return this.shelves.length > 0 && this.shelves.every(s => s.id && s.label && s.slots > 0);
    }
    return true;
  }

  agregarAnaquel() {
    this.shelves.push({
      id: `N${this.shelves.length + 1}`,
      label: `Estante ${this.shelves.length + 1}`,
      slots: 4
    });
  }

  quitarAnaquel(index: number) {
    this.shelves.splice(index, 1);
  }

  getTotalSlots(): number {
    return this.shelves.reduce((acc, curr) => acc + curr.slots, 0);
  }

  finalizar() {
    if (!this.canProceed()) return;

    this.loading = true;
    this.error = '';

    const defaultProducts = [
      { name: "Inca Kola 500ml", barcode: "7750885011500", price: 3.5, cost: 2.5, shelfLabel: "N4" },
      { name: "Coca Cola 500ml", barcode: "7750885011501", price: 3.5, cost: 2.5, shelfLabel: "N4" },
      { name: "Galleta Casino", barcode: "7750885011502", price: 1.2, cost: 0.8, shelfLabel: "N3" },
      { name: "Galleta Morochas", barcode: "7750885011503", price: 1.0, cost: 0.7, shelfLabel: "N3" },
      { name: "Papas Lays Clásicas", barcode: "7750885011504", price: 2.5, cost: 1.8, shelfLabel: "N3" },
      { name: "Agua San Mateo 600ml", barcode: "7750885011505", price: 2.0, cost: 1.2, shelfLabel: "N4" },
      { name: "Leche Gloria Evaporada", barcode: "7750885011506", price: 4.2, cost: 3.5, shelfLabel: "N1" },
      { name: "Arroz Costeño 1kg", barcode: "7750885011507", price: 4.8, cost: 3.8, shelfLabel: "N1" },
      { name: "Aceite Primor 1L", barcode: "7750885011508", price: 10.5, cost: 8.5, shelfLabel: "N1" },
      { name: "Yogurt Gloria Fresa 1kg", barcode: "7750885011509", price: 6.5, cost: 5.0, shelfLabel: "N2" }
    ];

    const payload = {
      tiendaData: {
        nombre: this.info.name,
        direccion: `${this.info.address}, ${this.info.city}, ${this.info.region}`
      },
      adminData: {
        nombre: this.creds.adminName,
        email: this.creds.adminUsername,
        password: this.creds.adminPassword
      },
      shelves: this.shelves,
      products: this.seedTemplate ? defaultProducts : []
    };

    this.tiendasService.crearTienda(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirigir a la lista de tiendas para verla
        this.router.navigate(['/portal/tiendas']).then(() => {
          // Recargar para forzar el fetching actualizado
          window.location.reload();
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Ocurrió un error al crear la tienda. Verifica los datos.';
        console.error(err);
      }
    });
  }
}
