import { Routes } from '@angular/router';
import { ExpenseIndexPageComponent } from '@expense/pages/expense-index-page/expense-index-page.component';

export const EXPENSE_BASE = 'expenses';

export const cardsPaths = {
  index: '',
};

export const EXPENSE_ROUTES: Routes = [
  {
    path: cardsPaths.index,
    component: ExpenseIndexPageComponent,
  },
];
