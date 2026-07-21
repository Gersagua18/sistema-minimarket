import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginTienda } from './login-tienda';

describe('LoginTienda', () => {
  let component: LoginTienda;
  let fixture: ComponentFixture<LoginTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginTienda],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginTienda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
