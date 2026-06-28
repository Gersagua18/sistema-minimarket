import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarProductos } from './buscar-productos';

describe('BuscarProductos', () => {
  let component: BuscarProductos;
  let fixture: ComponentFixture<BuscarProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscarProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
