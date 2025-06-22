import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { toShortDate } from '@common/utils/formatUtils';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpensesService } from '@expense/services/expenses.service';
import {
  AddExpense,
  DateRange,
  EMPTY_EXPENSES,
  EMPTY_EXPENSE_FILTER,
  Expense,
  ExpenseFilter,
  ExpenseFilterOptions,
  ExpenseOptions,
  ExpenseSearchOptions,
} from '@expense/types/expensesTypes';
import {
  getSortType,
  mapExpense,
  validateFilter,
} from '@expense/utils/expenseUtils';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-expense-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTableComponent,
    SearchBarComponent,
    PageLayoutComponent,
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

  expenses: Expense[] = [];
  totalItems: number = 0;

  constructor(
    private expenseService: ExpensesService,
    private catalogService: CatalogService,
    private notifService: NotificationService,
    private router: Router
  ) {
    const today = new Date();
    const monthlyPeriod: DateRange = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    };
    this.options.filter.period = monthlyPeriod;
  }

  get tableHeader(): string {
    if (this.options.filter.period === undefined) {
      return 'All Expenses';
    } else {
      const period = this.options.filter.period;
      return `Expenses from ${toShortDate(period.start)} to ${toShortDate(
        period.end
      )}`;
    }
  }

  ngOnInit(): void {
    this.getExpenses();
    this.getCatalog();
  }

  loadExpenses(e: PaginationEvent) {
    this.options.pagination = { page: e.pageIndex, pageSize: e.pageSize };
    this.getExpenses();
  }

  sortExpenses(event: Sort) {
    this.options.sorting = getSortType(event);
    this.getExpenses();
  }

  refresh(event: number) {
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

  goToDaily(){
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const year = today.getFullYear();

    this.router.navigate([`/expenses/daily/${month}/${year}`]);
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
    return validateFilter(this.options.filter);
  }

  private getExpenses() {
    this.expenseService.getExpenses(this.options).subscribe(
      (response) => {
        const { expenses, totalItems } = mapExpense(response);
        this.expenses = expenses;
        this.totalItems = totalItems;
      },
      this.errorResponse,
      this.completed
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
      this.errorResponse,
      this.completed
    );
  }

  private getExpenseTypeCatalog() {
    this.catalogService.getExpensesTypes().subscribe(
      (response) => {
        this.catalog.expenseTypes = response.data;
      },
      this.errorResponse,
      this.completed
    );
  }

  private getVendorCatalog() {
    this.catalogService.getVendors().subscribe(
      (response) => {
        this.catalog.vendors = response.data;
      },
      this.errorResponse,
      this.completed
    );
  }

  private errorResponse(err: HttpErrorResponse) {
    this.error = true;
    this.notifService.showError(err);
  }

  private completed() {
    this.error = true;
    this.isLoading = false;
  }
}
