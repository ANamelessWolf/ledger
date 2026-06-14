import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { NotificationService } from '@common/services/notification.service';
import { PaginationEvent } from '@config/commonTypes';
import { ExpensesService } from '@expense/services/expenses.service';
import {
  EMPTY_EXPENSES,
  Expense,
  ExpenseOptions,
  ExpenseRequest,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';

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
  pageSize: number = 25;

  public constructor(
    private expenseService: ExpensesService,
    private notifService: NotificationService,
    private dialog: MatDialog
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
      total: expense.rawTotal,
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
    this.expenseService.editExpense(request.id, request.body).subscribe(
      () => {
        this.notifService.showNotification('Expense updated successfully', 'success');
        this.expenseEdited.emit(request.id);
      },
      (err: HttpErrorResponse) => { this.notifService.showError(err); }
    );
  }

  deleteExpense(expense: Expense) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete expense?',
        message: `"${expense.description}" will be permanently deleted. This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.expenseService.deleteExpense(expense.id).subscribe({
        next: () => {
          this.notifService.showNotification('Expense deleted', 'success');
          this.expenseEdited.emit(expense.id);
        },
        error: (err: HttpErrorResponse) => { this.notifService.showError(err); },
      });
    });
  }
}
