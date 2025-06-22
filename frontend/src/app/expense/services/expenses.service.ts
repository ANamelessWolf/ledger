import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isValidDate } from '@common/utils/dateUtils';
import { QueryBuilder } from '@common/utils/filterUtils';
import { Pagination, SortType } from '@config/commonTypes';
import { LEDGER_API } from '@config/constants';
import { ExpenseCreateFormComponent } from '@expense/components/expense-create-form/expense-create-form.component';
import { ExpenseEditFormComponent } from '@expense/components/expense-edit-form/expense-edit-form.component';
import { ExpenseFilterFormComponent } from '@expense/components/expense-filter-form/expense-filter-form.component';
import {
  AddExpense,
  ExpenseFilter,
  ExpenseFilterOptions,
  ExpenseOptions,
  ExpenseRequest,
  ExpenseSearchOptions,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  getExpenses(options: ExpenseSearchOptions): Observable<any> {
    const { pagination, sorting, filter } = options;
    const query = this.getExpensesQueryString(pagination, filter, sorting);
    return this.http.get(`${LEDGER_API.EXPENSES}?${query}`);
  }

  getDailyExpenses(month: number, year: number): Observable<any> {
    return this.http.get(`${LEDGER_API.EXPENSES}/daily/${month}/${year}`);
  }

  createExpense(body: AddExpense): Observable<any> {
    return this.http.post(`${LEDGER_API.EXPENSES}`, body);
  }

  editExpense(id: number, body: UpdateExpense): Observable<any> {
    return this.http.put(`${LEDGER_API.EXPENSES}/${id}`, body);
  }

  // Dialogs
  showCreateExpenseDialog(
    header: string,
    options: ExpenseOptions,
    expenseAdded: (newExpense: AddExpense) => void
  ) {
    const dialogRef = this.dialog.open(ExpenseCreateFormComponent, {
      width: '600px',
      data: {
        header: header,
        options: options,
        expenseAdded: expenseAdded,
      },
    });
    return dialogRef.afterClosed();
  }

  showEditExpenseDialog(
    header: string,
    expense: UpdateExpense,
    options: ExpenseOptions,
    expenseUpdated: (request: ExpenseRequest) => void
  ) {
    const dialogRef = this.dialog.open(ExpenseEditFormComponent, {
      width: '600px',
      data: {
        header,
        expense,
        options,
        expenseUpdated,
      },
    });
    return dialogRef.afterClosed();
  }

  showFilterExpenseDialog(
    options: ExpenseFilterOptions,
    filterSelected: (filter: ExpenseFilter) => void
  ) {
    const header: string = 'Expense Filters';
    const dialogRef = this.dialog.open(ExpenseFilterFormComponent, {
      width: '800px',
      data: {
        header: header,
        options: options,
        filterSelected: filterSelected,
      },
    });
    return dialogRef.afterClosed();
  }

  private getExpensesQueryString = (
    pagination: Pagination,
    filter: ExpenseFilter,
    sorting?: SortType
  ): string => {
    const query = new QueryBuilder();

    // Pagination
    query.addPagination(pagination);

    // Filter
    query.appendArrFilterProp('wallet', filter.wallet);
    query.appendArrFilterProp('expenseTypes', filter.expenseTypes);
    query.appendArrFilterProp('vendors', filter.vendors);
    query.appendDateFilter(filter.period);
    query.appendRangeFilter(filter.expenseRange);
    query.appendFilterProperty('description', filter.description);

    // Sorting
    query.addSorting(sorting);
    return query.queryAsString;
  };
}
