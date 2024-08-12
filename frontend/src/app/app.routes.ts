import { Routes } from '@angular/router';
import { SideScreenComponent } from '@common/components/side-screen/side-screen.component';
import { initLedgerGuardGuard } from '@config/guards/init-ledger-guard.guard';
import { HOME_BASE } from '@home/home.routes';
import { CARD_BASE } from '@card/card.routes';
import { EXPENSE_BASE } from '@expense/expenses.routes';
import { WALLET_BASE } from './wallet/wallet.routes';
import { MONTHLY_NO_INT_BASE } from './monthly/mo-no-int.routes';

export const routes: Routes = [
  {
    path: '',
    component: SideScreenComponent,
    canActivate: [initLedgerGuardGuard],
    children: [
      {
        path: HOME_BASE,
        loadChildren: () =>
          import('@home/home.routes').then((mod) => mod.HOME_ROUTES),
      },
      {
        path: CARD_BASE,
        loadChildren: () =>
          import('@card/card.routes').then((mod) => mod.CARD_ROUTES),
      },
      {
        path: EXPENSE_BASE,
        loadChildren: () =>
          import('@expense/expenses.routes').then((mod) => mod.EXPENSE_ROUTES),
      },
      {
        path: WALLET_BASE,
        loadChildren: () =>
          import('@wallet/wallet.routes').then((mod) => mod.WALLET_ROUTES),
      },
      {
        path: MONTHLY_NO_INT_BASE,
        loadChildren: () =>
          import('@moNoInt/mo-no-int.routes').then(
            (mod) => mod.MONTHLY_NO_INT_ROUTES
          ),
      },
    ],
  },
];
