import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajadorLayout } from './trabajador-layout';

describe('TrabajadorLayout', () => {
  let component: TrabajadorLayout;
  let fixture: ComponentFixture<TrabajadorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajadorLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(TrabajadorLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
