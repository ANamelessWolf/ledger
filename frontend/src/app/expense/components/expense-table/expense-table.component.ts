import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { PaginationEvent } from '@config/commonTypes';
import { MatButtonModule } from '@angular/material/button';
import { ExpensesService } from '@expense/services/expenses.service';
import { NotificationService } from '@common/services/notification.service';
import {
  EMPTY_EXPENSES,
  Expense,
  ExpenseOptions,
  ExpenseRequest,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    LedgerIconComponent,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './expense-table.component.html',
  styleUrls: ['./expense-table.component.scss'],
  providers: [ExpensesService, NotificationService],
})
export class ExpenseTableComponent {
  @Input() header: string = '';
  @Input() expenses: Expense[] = [];
  @Input() totalItems: number = 0;
  @Input() catalog: ExpenseOptions = EMPTY_EXPENSES;
  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() expenseEdited = new EventEmitter<number>();

  displayedColumns: string[] = [
    'id',
    'wallet',
    'expense',
    'total',
    'buyDate',
    'actions',
  ];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;

  public constructor(
    private expenseService: ExpensesService,
    private notifService: NotificationService
  ) {}

  pageChanged(event: PaginationEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex, pageSize });
  }

  sortChanged(event: Sort) {
    this.sortChange.emit(event);
  }

  editExpense(id: number, expense: Expense) {
    const expUpd: UpdateExpense = {
      id,
      walletId: expense.walletId,
      expenseTypeId: expense.expenseTypeId,
      vendorId: expense.vendorId,
      total: expense.value,
      buyDate: expense.buyDate,
      description: expense.description,
    };
    this.expenseService
      .showEditExpenseDialog(
        'Update expense',
        expUpd,
        this.catalog,
        this.expenseUpdated.bind(this)
      )
      .subscribe();
  }

  expenseUpdated(request: ExpenseRequest) {
    console.log(request);
    this.expenseService.editExpense(request.id, request.body).subscribe(
      (response) => {
        this.notifService.showNotification(
          'Expense updated succesfully',
          'success'
        );
        this.expenseEdited.emit(request.id);
      },
      (err: HttpErrorResponse) => {
        this.notifService.showError(err);
      },
      //Complete
      () => {}
    );
  }
}
