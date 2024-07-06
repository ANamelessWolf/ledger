import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpensesService } from '@expense/services/expenses.service';
import {
  AddExpense,
  EMPTY_EXPENSES,
  EMPTY_EXPENSE_FILTER,
  ExpenseFilter,
  ExpenseFilterOptions,
  ExpenseOptions,
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
    SearchBarComponent,
  ],
  templateUrl: './expense-index-page.component.html',
  styleUrl: './expense-index-page.component.scss',
  providers: [ExpensesService, CatalogService, NotificationService],
})
export class ExpenseIndexPageComponent implements OnInit {
  options: ExpenseSearchOptions = {
    pagination: EMPTY_PAGINATION,
    sorting: undefined,
    filter: EMPTY_EXPENSE_FILTER,
  };
  catalog: ExpenseOptions = EMPTY_EXPENSES;
  isLoading = true;
  error = false;

  expenses: any[] = [];
  totalItems: number = 0;

  constructor(
    private expenseService: ExpensesService,
    private catalogService: CatalogService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getExpenses();
    this.getCatalog();
  }

  loadExpenses(e: PaginationEvent) {
    this.options.pagination = { page: e.pageIndex, pageSize: e.pageSize };
    this.getExpenses();
  }

  getField(field: string) {
    switch (field) {
      case 'wallet':
        return 'walletId';
      case 'expense':
        return 'description';
      default:
        return field;
    }
  }

  sortExpenses(event: Sort) {
    this.options.sorting = {
      orderBy: this.getField(event.active),
      orderDirection: event.direction === 'asc' ? 'ASC' : 'DESC',
    };
    this.getExpenses();
  }

  addExpense() {
    this.expenseService
      .showCreateExpenseDialog(
        'Add new expense',
        this.catalog,
        this.expenseAdded.bind(this)
      )
      .subscribe();
  }

  expenseAdded(newExpense: AddExpense) {
    this.expenseService.createExpense(newExpense).subscribe(
      (response) => {
        this.notifService.showNotification(
          'Expense added succesfully',
          'success'
        );
        this.getExpenses();
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

  onSearch(searchTerm: string) {
    this.options.filter.description = searchTerm;
    this.getExpenses();
  }

  openFilter() {
    const options: ExpenseFilterOptions = {
      wallets: this.catalog.wallets,
      expenseTypes: this.catalog.expenseTypes,
      vendors: this.catalog.vendors,
      filter: this.options.filter,
      visibility: {
        enableWallet: true,
        enableExpenseTypes: true,
        enableVendors: true,
      },
    };
    this.expenseService
      .showFilterExpenseDialog(options, this.applyFilter.bind(this))
      .subscribe();
  }

  applyFilter(filter: ExpenseFilter) {
    this.options.filter = filter;
    this.getExpenses();
  }

  get hasFilter() {
    const filter: ExpenseFilter = this.options.filter;
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

  private getCatalog() {
    this.getWalletCatalog();
    this.getExpenseTypeCatalog();
    this.getVendorCatalog();
  }

  private getWalletCatalog() {
    this.catalogService.getWallets().subscribe(
      (response) => {
        this.catalog.wallets = response.data;
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

  private getExpenseTypeCatalog() {
    this.catalogService.getExpensesTypes().subscribe(
      (response) => {
        this.catalog.expenseTypes = response.data;
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

  private getVendorCatalog() {
    this.catalogService.getVendors().subscribe(
      (response) => {
        this.catalog.vendors = response.data;
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
