import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificarProductos } from './verificar-productos';

describe('VerificarProductos', () => {
  let component: VerificarProductos;
  let fixture: ComponentFixture<VerificarProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificarProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificarProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
