import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Pagination, SortType } from '@config/commonTypes';
import { LEDGER_API } from '@config/constants';
import { ExpenseCreateFormComponent } from '@expense/components/expense-create-form/expense-create-form.component';
import {
  AddExpense,
  ExpenseFilter,
  ExpenseOptions,
  ExpenseSearchOptions,
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

  createExpense(body: AddExpense): Observable<any> {
    return this.http.post(`${LEDGER_API.EXPENSES}`, body);
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

  private getExpensesQueryString = (
    pagination: Pagination,
    filter: ExpenseFilter,
    sorting?: SortType
  ): string => {
    let query = '';

    // Pagination
    if (pagination.page) {
      query += `page=${pagination.page}`;
    } else {
      query += 'page=1';
    }

    if (pagination.pageSize) {
      query += `&pageSize=${pagination.pageSize}`;
    } else {
      query += `&pageSize=10`;
    }

    // Filter
    if (filter.wallet) {
      query += `&wallet=${filter.wallet.join(',')}`;
    }

    if (filter.expenseTypes) {
      query += `&expenseTypes=${filter.expenseTypes.join(',')}`;
    }

    if (filter.vendors) {
      query += `&vendors=${filter.vendors.join(',')}`;
    }

    if (filter.period) {
      query += `&start=${filter.period.start.toISOString()}`;
      query += `&end=${filter.period.end.toISOString()}`;
    }

    if (filter.expenseRange) {
      query += `&min=${filter.expenseRange.min}`;
      query += `&max=${filter.expenseRange.max}`;
    }

    if (filter.description) {
      query += `&description=${filter.description}`;
    }

    // Sorting
    if (sorting && sorting.orderBy) {
      query += `&orderBy=${sorting.orderBy}`;
      if (sorting.orderDirection) {
        query += `&orderDirection=${sorting.orderDirection}`;
      } else {
        query += '&orderDirection=ASC';
      }
    }
    return query;
  };
}
