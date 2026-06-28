import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarInventario } from './gestionar-inventario';

describe('GestionarInventario', () => {
  let component: GestionarInventario;
  let fixture: ComponentFixture<GestionarInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
