import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { ExpensesService } from '@expense/services/expenses.service';
import { AddExpense, ExpenseOptions } from '@expense/types/expensesTypes';
import { SubscriptionDashboardComponent } from '@subscription/components/subscription-dashboard/subscription-dashboard.component';
import { SubscriptionSummaryComponent } from '@subscription/components/subscription-summary/subscription-summary.component';
import { SubscriptionService } from '@subscription/services/subscription.service';
import {
  AddSubscription,
  Subscription,
  SubscriptionSummary,
  UpdateSubscription,
} from '@subscription/types/subscriptionTypes';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PageLayoutComponent,
    SubscriptionDashboardComponent,
    SubscriptionSummaryComponent,
  ],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss',
  providers: [SubscriptionService, CatalogService, ExpensesService, NotificationService],
})
export class SubscriptionPageComponent implements OnInit {
  subscriptions: Subscription[] = [];
  summary: SubscriptionSummary | null = null;

  wallets: CatalogItem[] = [];
  currencies: CatalogItem[] = [];
  paymentFrequencies: CatalogItem[] = [];
  expenseOptions: ExpenseOptions = { wallets: [], expenseTypes: [], vendors: [] };

  constructor(
    private subscriptionService: SubscriptionService,
    private catalogService: CatalogService,
    private expensesService: ExpensesService,
    private notifService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadSubscriptions();
  }

  onSummaryPeriodChange(period: { month: number; year: number }): void {
    this.subscriptionService.getSummary(period.month, period.year).subscribe({
      next: (res) => (this.summary = res.data ?? null),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  addSubscription(): void {
    this.subscriptionService.showSubscriptionFormDialog({
      wallets: this.wallets,
      currencies: this.currencies,
      paymentFrequencies: this.paymentFrequencies,
      onSaved: (data: AddSubscription) => {
        this.subscriptionService.createSubscription(data).subscribe({
          next: () => {
            this.notifService.showNotification('Subscription created', 'success');
            this.loadSubscriptions();
          },
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      },
    }).subscribe();
  }

  onEdit(subscription: Subscription): void {
    const updateData: UpdateSubscription = {
      id: subscription.id,
      name: subscription.name,
      price: subscription.price,
      walletId: subscription.walletId,
      currencyId: subscription.currencyId,
      paymentFrequencyId: subscription.paymentFrequencyId,
      chargeDay: subscription.chargeDay,
      lastPaymentDate: subscription.lastPaymentDate,
      active: subscription.active,
    };
    this.subscriptionService.showSubscriptionFormDialog({
      subscription: updateData,
      wallets: this.wallets,
      currencies: this.currencies,
      paymentFrequencies: this.paymentFrequencies,
      onSaved: (data: AddSubscription) => {
        this.subscriptionService.updateSubscription(subscription.id, { ...data, id: subscription.id }).subscribe({
          next: () => {
            this.notifService.showNotification('Subscription updated', 'success');
            this.loadSubscriptions();
          },
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      },
    }).subscribe();
  }

  onDelete(subscription: Subscription): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Subscription',
        message: `Delete "${subscription.name}"? This will also remove all associated payment history records.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.subscriptionService.deleteSubscription(subscription.id).subscribe({
        next: () => {
          this.notifService.showNotification('Subscription deleted', 'success');
          this.loadSubscriptions();
          if (this.summary) {
            this.onSummaryPeriodChange({ month: this.summary.month, year: this.summary.year });
          }
        },
        error: (err: HttpErrorResponse) => this.notifService.showError(err),
      });
    });
  }

  onAddPayment(subscription: Subscription): void {
    this.subscriptionService.getPaymentHistory(subscription.id).subscribe({
      next: (res) => {
        const existingPayments = (res.data ?? []).map((p: any) => ({ id: p.id, expenseId: p.expenseId }));
        this.subscriptionService.showAddPaymentDialog({
          subscriptionId: subscription.id,
          subscriptionName: subscription.name,
          expenseOptions: this.expenseOptions,
          existingPayments,
          onPaymentsAdded: (expenseIds: number[]) => {
            this.subscriptionService.addPayments(subscription.id, expenseIds).subscribe({
              next: () => {
                this.notifService.showNotification('Payment(s) added', 'success');
                this.loadSubscriptions();
                if (this.summary) {
                  this.onSummaryPeriodChange({ month: this.summary.month, year: this.summary.year });
                }
              },
              error: (err: HttpErrorResponse) => this.notifService.showError(err),
            });
          },
          onPaymentUnlinked: (paymentHistoryId: number) => {
            this.subscriptionService.removePayment(subscription.id, paymentHistoryId).subscribe({
              next: () => {
                this.notifService.showNotification('Payment unlinked', 'success');
                if (this.summary) {
                  this.onSummaryPeriodChange({ month: this.summary.month, year: this.summary.year });
                }
              },
              error: (err: HttpErrorResponse) => this.notifService.showError(err),
            });
          },
          onExpenseCreated: (expense: AddExpense, onCreated: (id: number) => void) => {
            this.expensesService.createExpense(expense).subscribe({
              next: (res) => onCreated(res.data?.id),
              error: (err: HttpErrorResponse) => this.notifService.showError(err),
            });
          },
        }).subscribe();
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  onViewHistory(subscription: Subscription): void {
    this.subscriptionService.showPaymentHistoryDialog({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      onPaymentRemoved: (paymentId: number) => {
        this.subscriptionService.removePayment(subscription.id, paymentId).subscribe({
          next: () => {
            this.notifService.showNotification('Payment removed', 'success');
            if (this.summary) {
              this.onSummaryPeriodChange({ month: this.summary.month, year: this.summary.year });
            }
          },
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      },
    }).subscribe();
  }

  onSearch(term: string): void {}

  private loadSubscriptions(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (res) => (this.subscriptions = res.data ?? []),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  private loadCatalogs(): void {
    this.catalogService.getWallets().subscribe({
      next: (res) => {
        this.wallets = res.data ?? [];
        this.expenseOptions = { ...this.expenseOptions, wallets: this.wallets };
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
    this.catalogService.getCurrencies().subscribe({
      next: (res) => (this.currencies = res.data ?? []),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
    this.catalogService.getPaymentFrequencies().subscribe({
      next: (res) => (this.paymentFrequencies = res.data ?? []),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
    this.catalogService.getExpensesTypes().subscribe({
      next: (res) => {
        this.expenseOptions = { ...this.expenseOptions, expenseTypes: res.data ?? [] };
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
    this.catalogService.getVendors().subscribe({
      next: (res) => {
        this.expenseOptions = { ...this.expenseOptions, vendors: res.data ?? [] };
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }
}
