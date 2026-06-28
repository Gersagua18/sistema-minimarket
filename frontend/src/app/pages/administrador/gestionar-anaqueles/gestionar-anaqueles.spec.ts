import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarAnaqueles } from './gestionar-anaqueles';

describe('GestionarAnaqueles', () => {
  let component: GestionarAnaqueles;
  let fixture: ComponentFixture<GestionarAnaqueles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarAnaqueles],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarAnaqueles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
