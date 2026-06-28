import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTrabajador } from './dashboard-trabajador';

describe('DashboardTrabajador', () => {
  let component: DashboardTrabajador;
  let fixture: ComponentFixture<DashboardTrabajador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTrabajador],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTrabajador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
