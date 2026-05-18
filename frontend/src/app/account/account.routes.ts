import { Routes } from '@angular/router';
import { AccountIndexPageComponent } from './pages/account-index-page/account-index-page.component';

export const ACCOUNT_BASE = 'accounts';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountIndexPageComponent,
  },
];
