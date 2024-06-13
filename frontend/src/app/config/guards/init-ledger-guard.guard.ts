import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const initLedgerGuardGuard: CanActivateFn = (route, state) => {
  const setupIsReady = true;

  if (!setupIsReady) {
    const router = inject(Router);
    //Nav to setup URL
    return false;
  } else {
    return true;
  }
};
