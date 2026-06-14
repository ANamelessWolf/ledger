import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { toShortDate } from '@common/utils/formatUtils';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpenseTopChartComponent } from '@expense/components/expense-top-chart/expense-top-chart.component';
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
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { WalletService } from '@wallet/services/wallet.service';
import { WalletItem } from '@wallet/types/wallet.types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-expense-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ExpenseTableComponent,
    ExpenseTopChartComponent,
    PageLayoutComponent,
    CurrencyFormatPipe,
  ],
  templateUrl: './expense-index-page.component.html',
  styleUrl: './expense-index-page.component.scss',
  providers: [ExpensesService, CatalogService, NotificationService],
})
export class ExpenseIndexPageComponent implements OnInit {
  options: ExpenseSearchOptions = {
    pagination: EMPTY_PAGINATION,
    sorting: undefined,
    filter: { ...EMPTY_EXPENSE_FILTER },
  };
  catalog: ExpenseOptions = EMPTY_EXPENSES;
  isLoading = true;
  error = false;

  expenses: Expense[] = [];
  totalItems: number = 0;
  chartExpenses: Expense[] = [];
  walletItems: WalletItem[] = [];
  walletGroupCardMap: Map<string, string> = new Map();

  get chartTotal(): number {
    return this.chartExpenses
      .filter(e => e.value > 0)
      .reduce((sum, e) => sum + e.value, 0);
  }

  constructor(
    private expenseService: ExpensesService,
    private catalogService: CatalogService,
    private walletService: WalletService,
    private notifService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
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
      return `Expenses from ${toShortDate(period.start)} to ${toShortDate(period.end)}`;
    }
  }

  ngOnInit(): void {
    this.applyQueryParams();
    this.getExpenses();
    this.getChartExpenses();
    this.getCatalog();
    this.loadWalletCardLinks();
  }

  private applyQueryParams(): void {
    const p = this.route.snapshot.queryParams;
    if (p['start'] && p['end']) {
      this.options.filter.period = {
        start: new Date(p['start'] + 'T00:00:00'),
        end: new Date(p['end'] + 'T00:00:00'),
      };
    }
    this.options.filter.expenseTypes = p['expenseTypes']
      ? p['expenseTypes'].split(',').map(Number)
      : undefined;
    this.options.filter.vendors = p['vendors']
      ? p['vendors'].split(',').map(Number)
      : undefined;
  }

  loadExpenses(e: PaginationEvent) {
    this.options.pagination = { page: e.pageIndex, pageSize: e.pageSize };
    this.getExpenses();
  }

  sortExpenses(event: Sort) {
    this.options.sorting = getSortType(event);
    this.getExpenses();
  }

  refresh(_event: number) {
    this.getExpenses();
    this.getChartExpenses();
  }

  addExpense() {
    this.expenseService
      .showCreateExpenseDialog('Add new expense', this.catalog, this.expenseAdded.bind(this))
      .subscribe();
  }

  goToDaily() {
    const today = new Date();
    this.router.navigate([`/expenses/daily/${today.getMonth() + 1}/${today.getFullYear()}`]);
  }

  goToGroups() {
    this.router.navigate(['/expenses/groups']);
  }

  expenseAdded(newExpense: AddExpense) {
    this.expenseService.createExpense(newExpense).subscribe(
      (_response) => {
        this.notifService.showNotification('Expense added succesfully', 'success');
        this.getExpenses();
        this.getChartExpenses();
      },
      (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      },
      () => { this.isLoading = false; }
    );
  }

  onSearch(searchTerm: string) {
    this.options.filter.description = searchTerm;
    this.getExpenses();
    this.getChartExpenses();
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
    this.getChartExpenses();
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

  private getChartExpenses() {
    this.expenseService.getExpensesForChart(this.options.filter).subscribe(
      (response) => {
        const { expenses } = mapExpense(response);
        this.chartExpenses = expenses;
      }
    );
  }

  private loadWalletCardLinks(): void {
    forkJoin({
      wallets: this.walletService.getAllWallets(),
      cards: this.catalogService.getCreditCardsWithWalletGroup(),
    }).subscribe({
      next: ({ wallets, cards }: any) => {
        this.walletItems = wallets.data ?? [];

        const groupNameMap = new Map<number, string>();
        for (const w of this.walletItems) {
          if (w.walletGroupId && w.walletGroupName) {
            groupNameMap.set(w.walletGroupId, w.walletGroupName);
          }
        }

        const cardMap = new Map<string, string>();
        for (const card of (cards.data ?? [])) {
          if (card.walletGroupId) {
            const groupName = groupNameMap.get(card.walletGroupId);
            if (groupName && !cardMap.has(groupName)) {
              cardMap.set(groupName, `/cards/cc/${card.id}`);
            }
          }
        }
        this.walletGroupCardMap = cardMap;
      },
    });
  }

  private getCatalog() {
    this.getWalletCatalog();
    this.getExpenseTypeCatalog();
    this.getVendorCatalog();
  }

  private getWalletCatalog() {
    this.catalogService.getWallets().subscribe(
      (response) => { this.catalog.wallets = response.data; },
      this.errorResponse,
      this.completed
    );
  }

  private getExpenseTypeCatalog() {
    this.catalogService.getExpensesTypes().subscribe(
      (response) => { this.catalog.expenseTypes = response.data; },
      this.errorResponse,
      this.completed
    );
  }

  private getVendorCatalog() {
    this.catalogService.getVendors().subscribe(
      (response) => { this.catalog.vendors = response.data; },
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
