import { Routes } from '@angular/router';
import { WalletIndexPageComponent } from './pages/wallet-index-page/wallet-index-page.component';

export const WALLET_BASE = 'wallets';

export const walletPaths = {
  index: '',
};

export const WALLET_ROUTES: Routes = [
  {
    path: walletPaths.index,
    component: WalletIndexPageComponent,
  },
];
