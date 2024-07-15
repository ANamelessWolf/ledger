import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
