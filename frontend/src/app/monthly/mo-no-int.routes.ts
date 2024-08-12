import { Routes } from '@angular/router';
import { MoNoIntIndexPageComponent } from './pages/mo-no-int-index-page/mo-no-int-index-page.component';


export const MONTHLY_NO_INT_BASE = 'monoint';

export const MoNoIntPaths = {
  index: '',
};

export const MONTHLY_NO_INT_ROUTES: Routes = [
  {
    path: MoNoIntPaths.index,
    component: MoNoIntIndexPageComponent,
  },
];
