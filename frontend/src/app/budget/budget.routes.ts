import { Routes } from '@angular/router';
import { BudgetIndexPageComponent } from '@budget/pages/budget-index-page/budget-index-page.component';

export const BUDGET_BASE = 'budget';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    component: BudgetIndexPageComponent,
  },
];
