import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasStock } from './alertas-stock';

describe('AlertasStock', () => {
  let component: AlertasStock;
  let fixture: ComponentFixture<AlertasStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasStock],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
