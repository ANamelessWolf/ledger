import { TestBed } from '@angular/core/testing';

import { MoNoIntService } from './mo-no-int.service';

describe('MoNoIntService', () => {
  let service: MoNoIntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoNoIntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
