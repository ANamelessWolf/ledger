import { Routes } from '@angular/router';
import { ExpenseIndexPageComponent } from '@expense/pages/expense-index-page/expense-index-page.component';
import { ExpenseDailyPageComponent } from './pages/expense-daily-page/expense-daily-page.component';

export const EXPENSE_BASE = 'expenses';

export const expensePaths = {
  index: '',
  expense_daily_view: 'daily/:month/:year',
};

export const EXPENSE_ROUTES: Routes = [
  {
    path: expensePaths.index,
    component: ExpenseIndexPageComponent,
  },
  {
    path: expensePaths.expense_daily_view,
    component: ExpenseDailyPageComponent,
  },
];
