import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { getDateRange } from '@common/utils/dateUtils';
import { toShortDate } from '@common/utils/formatUtils';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpensesService } from '@expense/services/expenses.service';
import {
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

@Component({
  selector: 'app-wallet-expense-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTableComponent,
    SearchBarComponent,
    CurrencyFormatPipe,
  ],
  templateUrl: './wallet-expense-table.component.html',
  styleUrl: './wallet-expense-table.component.scss',
  providers: [ExpensesService, CatalogService, NotificationService],
})
export class WalletExpenseTableComponent implements OnInit, OnChanges {
  @Input() WalletId = 1;
  @Input() Period: DateRange = getDateRange(1, '');
  catalog: ExpenseOptions = EMPTY_EXPENSES;
  options: ExpenseSearchOptions = {
    pagination: EMPTY_PAGINATION,
    sorting: undefined,
    filter: EMPTY_EXPENSE_FILTER,
  };
  expenses: Expense[] = [];
  totalItems: number = 0;
  total: number = 0;
  isLoading = true;
  error = false;

  constructor(
    private expenseService: ExpensesService,
    private catalogService: CatalogService,
    private notifService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['WalletId']) {
      this.options.filter.wallet = [this.WalletId];
      this.options.filter.description = '';
      this.options.filter.period = this.Period;
      this.getExpenses();
    }
  }

  ngOnInit(): void {
    this.getCatalog();
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

  loadExpenses(e: PaginationEvent) {
    this.options.pagination = { page: e.pageIndex, pageSize: e.pageSize };
    this.getExpenses();
  }

  sortExpenses(event: Sort) {
    this.options.sorting = getSortType(event);
    this.getExpenses();
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
        enableWallet: false,
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
        const { expenses, totalItems, total } = mapExpense(response);
        this.expenses = expenses;
        this.totalItems = totalItems;
        this.total = total;
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
