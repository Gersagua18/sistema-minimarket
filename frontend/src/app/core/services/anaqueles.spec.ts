import { TestBed } from '@angular/core/testing';

import { Anaqueles } from './anaqueles';

describe('Anaqueles', () => {
  let service: Anaqueles;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Anaqueles);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
