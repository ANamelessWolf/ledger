import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@common/services/notification.service';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpensesService } from '@expense/services/expenses.service';
import {
  EMPTY_EXPENSE_FILTER,
  ExpenseSearchOptions,
} from '@expense/types/expensesTypes';

@Component({
  selector: 'app-expense-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTableComponent,
  ],
  templateUrl: './expense-index-page.component.html',
  styleUrl: './expense-index-page.component.scss',
  providers: [ExpensesService, NotificationService],
})
export class ExpenseIndexPageComponent implements OnInit {
  options: ExpenseSearchOptions = {
    pagination: EMPTY_PAGINATION,
    sorting: undefined,
    filter: EMPTY_EXPENSE_FILTER,
  };
  isLoading = true;
  error = false;

  expenses: any[] = [];
  totalItems: number = 0;

  constructor(
    private expenseService: ExpensesService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getExpenses();
  }

  loadExpenses(e: PaginationEvent) {
    this.options.pagination = { page: e.pageIndex, pageSize: e.pageSize };
    this.getExpenses();
  }

  private getExpenses() {
    this.expenseService.getExpenses(this.options).subscribe(
      (response) => {
        this.expenses = response.data.result.map((row: any) => {
          return {
            ...row,
          };
        });
        this.totalItems = response.data.pagination.total;
        console.log(this.expenses);
      },
      (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      },
      //Complete
      () => {
        this.isLoading = false;
      }
    );
  }
}
