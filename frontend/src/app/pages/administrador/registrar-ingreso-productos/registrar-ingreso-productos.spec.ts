import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarIngresoProductos } from './registrar-ingreso-productos';

describe('RegistrarIngresoProductos', () => {
  let component: RegistrarIngresoProductos;
  let fixture: ComponentFixture<RegistrarIngresoProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarIngresoProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarIngresoProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
