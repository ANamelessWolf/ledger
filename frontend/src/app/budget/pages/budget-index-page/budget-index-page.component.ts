import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import {
  AddBudget,
  AddBudgetItem,
  Budget,
  BudgetItemDetail,
  BudgetItemsFormData,
  BudgetSummary,
  SummaryRequest,
  UpdateBudget,
} from '@budget/types/budgetTypes';
import { BudgetService } from '@budget/services/budget.service';
import { BudgetManageDialogComponent } from '@budget/components/budget-manage-dialog/budget-manage-dialog.component';
import { BudgetSummaryCardComponent } from '@budget/components/budget-summary-card/budget-summary-card.component';
import { BudgetSummaryWidgetComponent } from '@budget/components/budget-summary-widget/budget-summary-widget.component';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-budget-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PageLayoutComponent,
    BudgetSummaryCardComponent,
    BudgetSummaryWidgetComponent,
  ],
  templateUrl: './budget-index-page.component.html',
  styleUrl: './budget-index-page.component.scss',
  providers: [BudgetService, CatalogService, NotificationService],
})
export class BudgetIndexPageComponent implements OnInit {
  summaries: BudgetSummary[] = [];
  yearRange: { minYear: number; maxYear: number } | null = null;
  allBudgetItems: BudgetItemDetail[] = [];
  private lastSummaryRequest: SummaryRequest | null = null;

  currencies: CatalogItem[] = [];
  expenseTypes: CatalogItem[] = [];
  vendors: CatalogItem[] = [];

  constructor(
    private budgetService: BudgetService,
    private catalogService: CatalogService,
    private notifService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllBudgetItems();
    this.loadCatalogs();
    this.loadYearRange();
  }

  onSummaryRequested(req: SummaryRequest): void {
    this.lastSummaryRequest = req;
    this.fetchSummaries(req);
  }

  onDetailsRequested(req: { budgetId: number; start: string; end: string }): void {
    this.budgetService.getBudgetItems(req.budgetId).subscribe(
      (response) => {
        const items: BudgetItemDetail[] = response.data ?? [];
        const expenseTypes = items.filter((i) => i.itemType === 1).map((i) => i.itemId);
        const vendors = items.filter((i) => i.itemType === 2).map((i) => i.itemId);

        const queryParams: Record<string, string> = { start: req.start, end: req.end };
        if (expenseTypes.length > 0) queryParams['expenseTypes'] = expenseTypes.join(',');
        if (vendors.length > 0) queryParams['vendors'] = vendors.join(',');

        this.router.navigate(['/expenses'], { queryParams });
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  addBudget(): void {
    this.budgetService
      .showBudgetFormDialog({
        currencies: this.currencies,
        onSaved: (data: AddBudget) => {
          this.budgetService.createBudget(data).subscribe(
            () => {
              this.notifService.showNotification('Budget created', 'success');
              this.refreshAll();
            },
            (err: HttpErrorResponse) => this.notifService.showError(err)
          );
        },
      })
      .subscribe();
  }

  openManageDialog(): void {
    this.budgetService.getBudgetsByOwnerId().subscribe(
      (res) => {
        const budgets: Budget[] = res.data ?? [];
        const ref = this.dialog.open(BudgetManageDialogComponent, {
          width: '680px',
          maxHeight: '90vh',
          data: {
            budgets,
            currencies: this.currencies,
            expenseTypes: this.expenseTypes,
            vendors: this.vendors,
            onBudgetSelected: (budget: Budget, setItems: (items: BudgetItemDetail[]) => void) => {
              this.budgetService.getBudgetItems(budget.id).subscribe(
                (r) => setItems(r.data ?? []),
                (err: HttpErrorResponse) => this.notifService.showError(err)
              );
            },
            onEditBudget: (budget: Budget, onDone: (updated: Budget[]) => void) => {
              this.budgetService
                .showBudgetFormDialog({
                  budget: { ...budget, id: budget.id },
                  currencies: this.currencies,
                  onSaved: (data: AddBudget) => {
                    this.budgetService
                      .updateBudget(budget.id, { ...data, id: budget.id } as UpdateBudget)
                      .subscribe(
                        () => {
                          this.notifService.showNotification('Budget updated', 'success');
                          if (this.lastSummaryRequest) this.fetchSummaries(this.lastSummaryRequest);
                          this.budgetService.getBudgetsByOwnerId().subscribe(
                            (r) => onDone(r.data ?? []),
                            (err: HttpErrorResponse) => this.notifService.showError(err)
                          );
                        },
                        (err: HttpErrorResponse) => this.notifService.showError(err)
                      );
                  },
                })
                .subscribe();
            },
            onDeleteBudget: (budget: Budget, onDone: (updated: Budget[]) => void) => {
              this.budgetService.deleteBudget(budget.id).subscribe(
                () => {
                  this.notifService.showNotification('Budget deleted', 'success');
                  if (this.lastSummaryRequest) this.fetchSummaries(this.lastSummaryRequest);
                  this.budgetService.getBudgetsByOwnerId().subscribe(
                    (r) => onDone(r.data ?? []),
                    (err: HttpErrorResponse) => this.notifService.showError(err)
                  );
                },
                (err: HttpErrorResponse) => this.notifService.showError(err)
              );
            },
            onManageItems: (
              budget: Budget,
              currentItems: BudgetItemDetail[],
              onDone: (updated: BudgetItemDetail[]) => void
            ) => {
              this.budgetService.getBudgetItems(budget.id).subscribe(
                (r) => {
                  const freshItems: BudgetItemDetail[] = r.data ?? [];
                  currentItems.splice(0, currentItems.length, ...freshItems);
                  const reload = () =>
                    this.budgetService.getBudgetItems(budget.id).subscribe(
                      (r2) => onDone(r2.data ?? []),
                      (err: HttpErrorResponse) => this.notifService.showError(err)
                    );
                  this.budgetService
                    .showBudgetItemsFormDialog({
                      budgetId: budget.id,
                      expenseTypes: this.expenseTypes,
                      vendors: this.vendors,
                      currentItems,
                      onItemAdded: (item: AddBudgetItem) => {
                        this.budgetService.addBudgetItem(budget.id, item).subscribe(
                          () => {
                            this.notifService.showNotification('Item added', 'success');
                            reload();
                          },
                          (err: HttpErrorResponse) => this.notifService.showError(err)
                        );
                      },
                      onItemRemoved: (itemId: number) => {
                        this.budgetService.removeBudgetItem(budget.id, itemId).subscribe(
                          () => {
                            this.notifService.showNotification('Item removed', 'success');
                            reload();
                          },
                          (err: HttpErrorResponse) => this.notifService.showError(err)
                        );
                      },
                    })
                    .subscribe();
                },
                (err: HttpErrorResponse) => this.notifService.showError(err)
              );
            },
          },
        });
        ref.afterClosed().subscribe((dirty: boolean) => {
          if (dirty) this.refreshAll();
        });
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  onManageItemsRequested(budgetId: number): void {
    this.budgetService.getBudgetItems(budgetId).subscribe(
      (r) => {
        const localItems: BudgetItemDetail[] = r.data ?? [];

        const reload = () =>
          this.budgetService.getBudgetItems(budgetId).subscribe(
            (r2) => {
              const newItems: BudgetItemDetail[] = r2.data ?? [];
              localItems.splice(0, localItems.length, ...newItems);
              this.allBudgetItems = [
                ...this.allBudgetItems.filter((i) => i.budgetId !== budgetId),
                ...newItems,
              ];
            },
            (err: HttpErrorResponse) => this.notifService.showError(err)
          );

        this.budgetService
          .showBudgetItemsFormDialog({
            budgetId,
            expenseTypes: this.expenseTypes,
            vendors: this.vendors,
            currentItems: localItems,
            onItemAdded: (item: AddBudgetItem) => {
              this.budgetService.addBudgetItem(budgetId, item).subscribe(
                () => {
                  this.notifService.showNotification('Item added', 'success');
                  reload();
                },
                (err: HttpErrorResponse) => this.notifService.showError(err)
              );
            },
            onItemRemoved: (itemId: number) => {
              this.budgetService.removeBudgetItem(budgetId, itemId).subscribe(
                () => {
                  this.notifService.showNotification('Item removed', 'success');
                  reload();
                },
                (err: HttpErrorResponse) => this.notifService.showError(err)
              );
            },
          } as BudgetItemsFormData)
          .subscribe();
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  onSearch(searchTerm: string): void {}

  private loadAllBudgetItems(): void {
    this.budgetService.getBudgetsByOwnerId().subscribe(
      (res) => {
        const budgets: Budget[] = res.data ?? [];
        if (budgets.length === 0) {
          this.allBudgetItems = [];
          return;
        }
        const calls = budgets.map((b) =>
          this.budgetService.getBudgetItems(b.id).pipe(
            map((r: any) => (r.data ?? []) as BudgetItemDetail[])
          )
        );
        forkJoin(calls).subscribe(
          (results) => (this.allBudgetItems = results.flat()),
          (err: HttpErrorResponse) => this.notifService.showError(err)
        );
      },
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private fetchSummaries(req: SummaryRequest): void {
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

  private refreshAll(): void {
    this.loadAllBudgetItems();
    if (this.lastSummaryRequest) this.fetchSummaries(this.lastSummaryRequest);
  }

  private loadYearRange(): void {
    this.catalogService.getExpenseYearRange().subscribe(
      (response) => (this.yearRange = response.data ?? null),
      (err: HttpErrorResponse) => this.notifService.showError(err)
    );
  }

  private loadCatalogs(): void {
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
}
