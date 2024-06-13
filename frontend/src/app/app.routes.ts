import { Routes } from '@angular/router';
import { SideScreenComponent } from '@common/components/side-screen/side-screen.component';
import { initLedgerGuardGuard } from '@config/guards/init-ledger-guard.guard';
import { HOME_BASE } from '@home/home.routes';
import { CARD_BASE } from '@card/card.routes';

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
    ],
  },
];
