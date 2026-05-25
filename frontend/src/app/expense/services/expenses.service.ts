import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QueryBuilder } from '@common/utils/filterUtils';
import { Pagination, SortType } from '@config/commonTypes';
import { LEDGER_API } from '@config/constants';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import {
  ExpenseCreateFormComponent,
  ExpenseCreateData,
} from '@expense/components/expense-create-form/expense-create-form.component';
import {
  ExpenseEditFormComponent,
  ExpenseEditData,
} from '@expense/components/expense-edit-form/expense-edit-form.component';
import {
  ExpenseFilterFormComponent,
  ExpenseFilterData,
} from '@expense/components/expense-filter-form/expense-filter-form.component';
import {
  AddExpense,
  ExpenseFilter,
  ExpenseFilterOptions,
  ExpenseOptions,
  ExpenseRequest,
  ExpenseSearchOptions,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { Observable, tap } from 'rxjs';

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

  getExpensesForChart(filter: ExpenseFilter): Observable<any> {
    const query = this.getExpensesQueryString({ page: 1, pageSize: 1000 }, filter);
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

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.EXPENSES}/${id}`);
  }

  // Dialogs
  showCreateExpenseDialog(
    header: string,
    options: ExpenseOptions,
    expenseAdded: (newExpense: AddExpense) => void
  ) {
    const data: ExpenseCreateData = {
      options,
      isValid:   () => false,
      getResult: () => ({} as AddExpense),
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '520px',
      data: {
        header,
        component:      ExpenseCreateFormComponent,
        data,
        validationData: data,
        buttons:        [DialogButton.CANCEL, DialogButton.SAVE],
        validate:       (d: ExpenseCreateData) => d.isValid(),
      } as DialogData,
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result?.button === DialogButton.SAVE) {
          expenseAdded(data.getResult());
        }
      })
    );
  }

  showEditExpenseDialog(
    header: string,
    expense: UpdateExpense,
    options: ExpenseOptions,
    expenseUpdated: (request: ExpenseRequest) => void
  ) {
    const data: ExpenseEditData = {
      expense,
      options,
      isValid:   () => false,
      getResult: () => ({ id: expense.id, body: expense }),
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '520px',
      data: {
        header,
        component:      ExpenseEditFormComponent,
        data,
        validationData: data,
        buttons:        [DialogButton.CANCEL, DialogButton.SAVE],
        validate:       (d: ExpenseEditData) => d.isValid(),
      } as DialogData,
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result?.button === DialogButton.SAVE) {
          expenseUpdated(data.getResult());
        }
      })
    );
  }

  showFilterExpenseDialog(
    options: ExpenseFilterOptions,
    filterSelected: (filter: ExpenseFilter) => void
  ) {
    const data: ExpenseFilterData = {
      options,
      isValid:   () => true,
      getResult: () => ({} as ExpenseFilter),
      reset:     () => {},
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '560px',
      data: {
        header:         'Expense Filters',
        component:      ExpenseFilterFormComponent,
        data,
        validationData: data,
        buttons:        [DialogButton.CLEAR, DialogButton.CANCEL, DialogButton.APPLY],
        validate:       (d: ExpenseFilterData) => d.isValid(),
        onClear:        () => data.reset(),
      } as DialogData,
    });

    return dialogRef.afterClosed().pipe(
      tap((result) => {
        if (result?.button === DialogButton.APPLY) {
          filterSelected(data.getResult());
        }
      })
    );
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
