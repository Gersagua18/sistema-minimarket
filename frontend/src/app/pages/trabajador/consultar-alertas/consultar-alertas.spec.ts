import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarAlertas } from './consultar-alertas';

describe('ConsultarAlertas', () => {
  let component: ConsultarAlertas;
  let fixture: ComponentFixture<ConsultarAlertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarAlertas],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarAlertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
