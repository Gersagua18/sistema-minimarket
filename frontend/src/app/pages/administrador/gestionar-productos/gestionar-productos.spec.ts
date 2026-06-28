import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarProductos } from './gestionar-productos';

describe('GestionarProductos', () => {
  let component: GestionarProductos;
  let fixture: ComponentFixture<GestionarProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
