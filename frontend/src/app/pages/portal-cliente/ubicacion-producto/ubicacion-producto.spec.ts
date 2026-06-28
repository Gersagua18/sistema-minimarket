import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicacionProducto } from './ubicacion-producto';

describe('UbicacionProducto', () => {
  let component: UbicacionProducto;
  let fixture: ComponentFixture<UbicacionProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbicacionProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(UbicacionProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
