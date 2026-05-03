import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import {
  AddBudget,
  AddBudgetItem,
  Budget,
  BudgetItemDetail,
  BudgetSummary,
  SummaryRequest,
} from '@budget/types/budgetTypes';
import { BudgetService } from '@budget/services/budget.service';
import { BudgetListComponent } from '@budget/components/budget-list/budget-list.component';
import { BudgetSummaryCardComponent } from '@budget/components/budget-summary-card/budget-summary-card.component';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-budget-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PageLayoutComponent,
    BudgetListComponent,
    BudgetSummaryCardComponent,
  ],
  templateUrl: './budget-index-page.component.html',
  styleUrl: './budget-index-page.component.scss',
  providers: [BudgetService, CatalogService, NotificationService],
})
export class BudgetIndexPageComponent implements OnInit {
  budgets: Budget[] = [];
  selectedBudget: Budget | null = null;
  budgetItems: BudgetItemDetail[] = [];
  summaries: BudgetSummary[] = [];
  yearRange: { minYear: number; maxYear: number } | null = null;

  currencies: CatalogItem[] = [];
  expenseTypes: CatalogItem[] = [];
  vendors: CatalogItem[] = [];

  constructor(
    private budgetService: BudgetService,
    private catalogService: CatalogService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.loadCatalogs();
    this.loadYearRange();
  }

  onSummaryRequested(req: SummaryRequest): void {
    const call =
      req.period === 'week'
        ? this.budgetService.getWeekSummary(1, req.start, req.end)
        : req.period === 'year'
        ? this.budgetService.getYearSummary(1, req.start, req.end)
        : this.budgetService.getMonthSummary(1, req.start, req.end);

    call.subscribe(
      (response) => (this.summaries = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  onBudgetSelected(budget: Budget) {
    this.selectedBudget = budget;
    this.loadBudgetItems(budget.id);
  }

  addBudget() {
    this.budgetService
      .showBudgetFormDialog({
        currencies: this.currencies,
        onSaved: this.onBudgetSaved.bind(this),
      })
      .subscribe();
  }

  onEditBudget(budget: Budget) {
    this.budgetService
      .showBudgetFormDialog({
        budget: { ...budget, id: budget.id },
        currencies: this.currencies,
        onSaved: (data) => this.onBudgetUpdated(budget.id, data),
      })
      .subscribe();
  }

  onDeleteBudget(budget: Budget) {
    this.budgetService.deleteBudget(budget.id).subscribe(
      () => {
        this.notifService.showNotification('Budget deleted', 'success');
        if (this.selectedBudget?.id === budget.id) {
          this.selectedBudget = null;
          this.budgetItems = [];
        }
        this.loadBudgets();
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  onManageItems(budget: Budget) {
    this.budgetService
      .showBudgetItemsFormDialog({
        budgetId: budget.id,
        expenseTypes: this.expenseTypes,
        vendors: this.vendors,
        currentItems: this.budgetItems,
        onItemAdded: (item) => this.onItemAdded(budget.id, item),
        onItemRemoved: (itemId) => this.onItemRemoved(budget.id, itemId),
      })
      .subscribe();
  }

  onSearch(searchTerm: string) {
    if (!searchTerm) {
      this.loadBudgets();
      return;
    }
    this.budgets = this.budgets.filter((b) =>
      b.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  private loadBudgets() {
    this.budgetService.getBudgetsByOwnerId().subscribe(
      (response) => (this.budgets = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private loadYearRange() {
    this.catalogService.getExpenseYearRange().subscribe(
      (response) => (this.yearRange = response.data ?? null),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private loadBudgetItems(budgetId: number) {
    this.budgetService.getBudgetItems(budgetId).subscribe(
      (response) => (this.budgetItems = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private loadCatalogs() {
    this.catalogService.getCurrencies().subscribe(
      (response) => (this.currencies = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
    this.catalogService.getExpensesTypes().subscribe(
      (response) => (this.expenseTypes = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
    this.catalogService.getVendors().subscribe(
      (response) => (this.vendors = response.data ?? []),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private onBudgetSaved(data: AddBudget) {
    this.budgetService.createBudget(data).subscribe(
      () => {
        this.notifService.showNotification('Budget created', 'success');
        this.loadBudgets();
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private onBudgetUpdated(id: number, data: AddBudget) {
    this.budgetService.updateBudget(id, { ...data, id }).subscribe(
      () => {
        this.notifService.showNotification('Budget updated', 'success');
        this.loadBudgets();
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private onItemAdded(budgetId: number, item: AddBudgetItem) {
    this.budgetService.addBudgetItem(budgetId, item).subscribe(
      () => {
        this.notifService.showNotification('Item added', 'success');
        this.loadBudgetItems(budgetId);
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private onItemRemoved(budgetId: number, itemId: number) {
    this.budgetService.removeBudgetItem(budgetId, itemId).subscribe(
      () => {
        this.notifService.showNotification('Item removed', 'success');
        this.loadBudgetItems(budgetId);
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }
}
