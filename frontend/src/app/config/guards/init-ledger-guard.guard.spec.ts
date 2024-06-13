import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { initLedgerGuardGuard } from './init-ledger-guard.guard';

describe('initLedgerGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => initLedgerGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
