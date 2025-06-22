import { Routes } from '@angular/router';
import { SubscriptionPageComponent } from './pages/subscription-page/subscription-page.component';

export const SUBSCRIPTION_BASE = 'subscription';

export const subscriptionPaths = {
  index: '',
};

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: subscriptionPaths.index,
    component: SubscriptionPageComponent,
  },
];
