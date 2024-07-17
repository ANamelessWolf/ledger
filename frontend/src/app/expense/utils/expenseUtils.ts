import { Sort } from '@angular/material/sort';
import { SortType } from '@config/commonTypes';
import { Expense, ExpenseFilter } from '@expense/types/expensesTypes';

export const mapExpense = (response: any) => {
  const expenses: Expense[] = response.data.result.map((row: any) => {
    return {
      ...row,
      description: row.description.replace('\n', '<br>'),
    };
  });
  const totalItems: number = response.data.pagination.total;
  return { expenses, totalItems, total: response.data.total };
};

export const validateFilter = (filter: ExpenseFilter): boolean => {
  if (
    filter.expenseRange &&
    filter.expenseRange.min >= 0 &&
    filter.expenseRange.max > 0
  ) {
    return true;
  }
  if (filter.expenseTypes && filter.expenseTypes.length > 0) {
    return true;
  }
  if (filter.vendors && filter.vendors.length > 0) {
    return true;
  }
  if (filter.wallet && filter.wallet.length > 0) {
    return true;
  }
  if (
    filter.period &&
    filter.period.end !== undefined &&
    filter.period.start !== undefined
  ) {
    return true;
  }
  return false;
};

export const getSortType = (event: Sort): SortType => {
  let field: string = event.active;
  if (event.active === 'wallet') {
    field = 'walletId';
  } else if (event.active === 'expense') {
    field = 'description';
  }
  return {
    orderBy: field,
    orderDirection: event.direction === 'asc' ? 'ASC' : 'DESC',
  };
};
