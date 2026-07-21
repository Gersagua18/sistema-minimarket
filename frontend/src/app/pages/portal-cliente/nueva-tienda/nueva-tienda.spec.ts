import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaTienda } from './nueva-tienda';

describe('NuevaTienda', () => {
  let component: NuevaTienda;
  let fixture: ComponentFixture<NuevaTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaTienda],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaTienda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
