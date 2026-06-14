import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { EMPTY_PAGINATION, PaginationEvent } from '@config/commonTypes';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { ExpenseTableComponent } from '@expense/components/expense-table/expense-table.component';
import { ExpenseTopChartComponent } from '@expense/components/expense-top-chart/expense-top-chart.component';
import { ExpenseGroupWizardComponent } from '@expense/components/expense-group-wizard/expense-group-wizard.component';
import { ExpenseGroupEditDialogComponent, EditGroupDialogData } from '@expense/components/expense-group-edit-dialog/expense-group-edit-dialog.component';
import { ExpenseGroupsService } from '@expense/services/expense-groups.service';
import { ExpensesService } from '@expense/services/expenses.service';
import { ExpenseGroup } from '@expense/types/expenseGroupTypes';
import { Expense, EMPTY_EXPENSES, ExpenseFilter, ExpenseFilterOptions, EMPTY_EXPENSE_FILTER } from '@expense/types/expensesTypes';
import { validateFilter } from '@expense/utils/expenseUtils';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expense-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    LedgerIconComponent,
    ExpenseTableComponent,
    ExpenseTopChartComponent,
    PageLayoutComponent,
    CurrencyFormatPipe,
  ],
  providers: [NotificationService, CatalogService, ExpensesService],
  templateUrl: './expense-groups-page.component.html',
  styleUrl: './expense-groups-page.component.scss',
})
export class ExpenseGroupsPageComponent implements OnInit {
  groups: ExpenseGroup[] = [];
  selectedGroupId: number | null = null;

  allGroupExpenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  displayedExpenses: Expense[] = [];
  searchTerm = '';
  pageIndex = 1;
  pageSize = 25;
  activeSort: Sort | null = null;
  activeFilter: ExpenseFilter = { ...EMPTY_EXPENSE_FILTER };

  isLoadingExpenses = false;

  catalog = EMPTY_EXPENSES;

  get hasFilter(): boolean {
    return validateFilter(this.activeFilter);
  }

  get selectedGroup(): ExpenseGroup | undefined {
    return this.groups.find(g => g.id === this.selectedGroupId);
  }

  get chartExpenses(): Expense[] {
    return this.filteredExpenses.filter(e => e.value > 0);
  }

  get chartTotal(): number {
    return this.chartExpenses.reduce((sum, e) => sum + e.value, 0);
  }

  get tableHeader(): string {
    if (!this.selectedGroup) return 'Expense Group';
    const count = this.filteredExpenses.length;
    if (count === 0) return this.selectedGroup.name;
    const dates = this.allGroupExpenses.map(e => e.buyDate);
    if (dates.length === 0) return `${this.selectedGroup.name} — ${count} expenses`;
    const sorted = [...dates].sort();
    return `${sorted[0]} – ${sorted[sorted.length - 1]} (${count} expenses)`;
  }

  constructor(
    private groupsService: ExpenseGroupsService,
    private expensesService: ExpensesService,
    private catalogService: CatalogService,
    private notifService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.catalogService.getWallets().subscribe({ next: (r) => { this.catalog.wallets = r.data; } });
    this.catalogService.getExpensesTypes().subscribe({ next: (r) => { this.catalog.expenseTypes = r.data; } });
    this.catalogService.getVendors().subscribe({ next: (r) => { this.catalog.vendors = r.data; } });
  }

  private loadGroups(selectId?: number): void {
    this.groupsService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.data ?? [];
        if (this.groups.length === 0) {
          this.openWizard();
        } else {
          const target = selectId ?? this.groups[0].id;
          this.selectedGroupId = target;
          this.loadGroupExpenses();
        }
      },
      error: (err: HttpErrorResponse) => { this.notifService.showError(err); },
    });
  }

  onGroupChange(id: number): void {
    this.selectedGroupId = id;
    this.loadGroupExpenses();
  }

  private loadGroupExpenses(): void {
    if (!this.selectedGroupId) return;
    this.isLoadingExpenses = true;
    this.allGroupExpenses = [];
    this.filteredExpenses = [];
    this.displayedExpenses = [];

    this.groupsService.getGroupExpenses(this.selectedGroupId).subscribe({
      next: (res) => {
        this.allGroupExpenses = res.data ?? [];
        this.applySearch();
        this.isLoadingExpenses = false;
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
        this.isLoadingExpenses = false;
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applySearch();
  }

  openFilter(): void {
    const options: ExpenseFilterOptions = {
      wallets: this.catalog.wallets,
      expenseTypes: this.catalog.expenseTypes,
      vendors: this.catalog.vendors,
      filter: this.activeFilter,
      visibility: { enableWallet: true, enableExpenseTypes: true, enableVendors: true },
    };
    this.expensesService.showFilterExpenseDialog(options, (filter: ExpenseFilter) => {
      this.activeFilter = filter;
      this.applySearch();
    }).subscribe();
  }

  sortExpenses(sort: Sort): void {
    this.activeSort = sort;
    this.applySort();
    this.applyPage();
  }

  private applySearch(): void {
    const q = this.searchTerm.toLowerCase();
    const f = this.activeFilter;

    this.filteredExpenses = this.allGroupExpenses.filter(e => {
      if (q && !e.description.toLowerCase().includes(q) &&
               !e.vendor.toLowerCase().includes(q) &&
               !e.expenseType.toLowerCase().includes(q)) return false;
      if (f.wallet?.length && !f.wallet.includes(e.walletId)) return false;
      if (f.expenseTypes?.length && !f.expenseTypes.includes(e.expenseTypeId)) return false;
      if (f.vendors?.length && !f.vendors.includes(e.vendorId)) return false;
      if (f.period) {
        const date = new Date(e.buyDate);
        if (date < new Date(f.period.start) || date > new Date(f.period.end)) return false;
      }
      return true;
    });

    this.pageIndex = 1;
    this.applySort();
    this.applyPage();
  }

  private applySort(): void {
    if (!this.activeSort || !this.activeSort.direction) return;

    const { active, direction } = this.activeSort;
    const dir = direction === 'asc' ? 1 : -1;

    this.filteredExpenses = [...this.filteredExpenses].sort((a, b) => {
      switch (active) {
        case 'id':       return (a.id - b.id) * dir;
        case 'wallet':   return a.wallet.localeCompare(b.wallet) * dir;
        case 'expense':  return a.description.localeCompare(b.description) * dir;
        case 'total':    return (a.value - b.value) * dir;
        case 'buyDate':  return (new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime()) * dir;
        default:         return 0;
      }
    });
  }

  private applyPage(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    this.displayedExpenses = this.filteredExpenses.slice(start, start + this.pageSize);
  }

  loadPage(e: PaginationEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.applyPage();
  }

  refreshExpenses(_id: number): void {
    this.loadGroupExpenses();
  }

  openWizard(): void {
    const ref = this.dialog.open(ExpenseGroupWizardComponent, {
      width: '660px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((group: ExpenseGroup | undefined) => {
      if (group) {
        this.loadGroups(group.id);
      }
    });
  }

  openEditDialog(): void {
    if (!this.selectedGroup) return;
    const data: EditGroupDialogData = { group: this.selectedGroup };
    const ref = this.dialog.open(ExpenseGroupEditDialogComponent, {
      width: '700px',
      data,
    });
    ref.afterClosed().subscribe((result?: { updated: boolean }) => {
      if (result?.updated) {
        this.loadGroups(this.selectedGroupId!);
      }
    });
  }

  deleteGroup(): void {
    if (!this.selectedGroup) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Delete group?',
        message: `"${this.selectedGroup.name}" and all its expense associations will be deleted. The expenses themselves will NOT be deleted.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed || !this.selectedGroupId) return;
      this.groupsService.deleteGroup(this.selectedGroupId).subscribe({
        next: () => {
          this.notifService.showNotification('Group deleted', 'success');
          this.selectedGroupId = null;
          this.loadGroups();
        },
        error: (err: HttpErrorResponse) => { this.notifService.showError(err); },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/expenses']);
  }
}
