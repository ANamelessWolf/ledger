import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LEDGER_API } from '@config/constants';
import { Observable, tap } from 'rxjs';
import { DialogButton } from '@config/enums';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { CatalogItem } from '@common/types/catalogTypes';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  AddSubscription,
  DEFAULT_SUBSCRIPTION_FILTER,
  ExistingPaymentRef,
  ExpenseSearchResult,
  PriceHistoryItem,
  Subscription,
  SubscriptionFilter,
  UpdateSubscription,
} from '@subscription/types/subscriptionTypes';
import { AddExpense, ExpenseOptions } from '@expense/types/expensesTypes';
import {
  SubscriptionFormComponent,
  SubscriptionFormDialogData,
} from '@subscription/components/subscription-form/subscription-form.component';
import {
  SubscriptionFilterDialogComponent,
  SubscriptionFilterFormData,
} from '@subscription/components/subscription-filter-dialog/subscription-filter-dialog.component';
import {
  SubscriptionAddPaymentComponent,
  SubscriptionAddPaymentFormData,
} from '@subscription/components/subscription-add-payment/subscription-add-payment.component';
import {
  SubscriptionPaymentHistoryComponent,
  SubscriptionPaymentHistoryFormData,
} from '@subscription/components/subscription-payment-history/subscription-payment-history.component';
import {
  SubscriptionPriceHistoryComponent,
  SubscriptionPriceHistoryFormData,
} from '@subscription/components/subscription-price-history/subscription-price-history.component';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  // ── HTTP ──────────────────────────────────────────────────────────────────

  getSubscriptions(): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}`);
  }

  getSubscriptionById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}/${id}`);
  }

  createSubscription(body: AddSubscription): Observable<any> {
    return this.http.post(`${LEDGER_API.SUBSCRIPTION}`, body);
  }

  updateSubscription(id: number, body: UpdateSubscription): Observable<any> {
    return this.http.put(`${LEDGER_API.SUBSCRIPTION}/${id}`, body);
  }

  deleteSubscription(id: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.SUBSCRIPTION}/${id}`);
  }

  getPaymentHistory(subscriptionId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}/${subscriptionId}/payments`);
  }

  addPayments(subscriptionId: number, expenseIds: number[]): Observable<any> {
    return this.http.post(`${LEDGER_API.SUBSCRIPTION}/${subscriptionId}/payments`, { expenseIds });
  }

  removePayment(subscriptionId: number, paymentId: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.SUBSCRIPTION}/${subscriptionId}/payments/${paymentId}`);
  }

  searchExpenses(description: string): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}/search-expenses?description=${encodeURIComponent(description)}`);
  }

  getSummary(month: number, year: number): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}/summary?month=${month}&year=${year}`);
  }

  getPriceHistory(subscriptionId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.SUBSCRIPTION}/${subscriptionId}/price-history`);
  }

  // ── Dialogs ───────────────────────────────────────────────────────────────

  showSubscriptionFormDialog(input: {
    subscription?: UpdateSubscription;
    walletGroups: CatalogItem[];
    currencies: CatalogItem[];
    paymentFrequencies: CatalogItem[];
    onSaved: (data: AddSubscription) => void;
  }): Observable<any> {
    const formData: SubscriptionFormDialogData = {
      ...input,
      isValid:   () => false,
      getResult: () => null,
      reset:     () => {},
    };
    const dialogData: DialogData = {
      header:         input.subscription ? 'Edit Subscription' : 'New Subscription',
      component:      SubscriptionFormComponent,
      data:           formData,
      validationData: formData,
      buttons:        [DialogButton.CANCEL, DialogButton.SAVE],
      validate:       (d) => d.isValid(),
    };
    return this.dialog.open(DialogWrapperComponent, { width: '560px', data: dialogData })
      .afterClosed()
      .pipe(tap((result: any) => {
        if (result?.button === DialogButton.SAVE) {
          const payload = formData.getResult();
          if (payload) formData.onSaved(payload);
        }
      }));
  }

  showFilterDialog(
    current: SubscriptionFilter,
    paymentFrequencies: CatalogItem[],
    walletGroups: CatalogItem[],
    onApply: (filter: SubscriptionFilter) => void
  ): void {
    const filterData: SubscriptionFilterFormData = {
      current: { ...current },
      paymentFrequencies,
      walletGroups,
      isValid:   () => true,
      getResult: () => ({ ...DEFAULT_SUBSCRIPTION_FILTER }),
      reset:     () => {},
    };
    const dialogData: DialogData = {
      header:         'Filter Subscriptions',
      component:      SubscriptionFilterDialogComponent,
      data:           filterData,
      validationData: filterData,
      buttons:        [DialogButton.CLEAR, DialogButton.CANCEL, DialogButton.APPLY],
      validate:       () => true,
      onClear:        () => filterData.reset(),
    };
    this.dialog.open(DialogWrapperComponent, { width: '420px', data: dialogData })
      .afterClosed()
      .subscribe((result: any) => {
        if (result?.button === DialogButton.APPLY) {
          onApply(filterData.getResult());
        }
      });
  }

  showAddPaymentDialog(input: {
    subscriptionId: number;
    subscriptionName: string;
    expenseOptions: ExpenseOptions;
    existingPayments?: ExistingPaymentRef[];
    onPaymentsAdded: (expenseIds: number[]) => void;
    onPaymentUnlinked: (paymentHistoryId: number) => void;
    onExpenseCreated: (expense: AddExpense, onCreated: (expenseId: number) => void) => void;
  }): Observable<any> {
    const formData: SubscriptionAddPaymentFormData = {
      ...input,
      existingPayments: input.existingPayments ?? [],
      onSearchExpenses: (description: string, callback: (results: ExpenseSearchResult[]) => void) => {
        this.searchExpenses(description).subscribe({
          next:  (res) => callback(res.data ?? []),
          error: () => callback([]),
        });
      },
      close:     () => {},
      isValid:   () => true,
      getResult: () => null,
      reset:     () => {},
    };
    const dialogData: DialogData = {
      header:         `Add Payment — ${input.subscriptionName}`,
      component:      SubscriptionAddPaymentComponent,
      data:           formData,
      validationData: formData,
      buttons:        [DialogButton.CANCEL],
      validate:       () => true,
    };
    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width:     '640px',
      maxHeight: '80vh',
      data:      dialogData,
    });
    formData.close = () => dialogRef.close();
    return dialogRef.afterClosed();
  }

  showPaymentHistoryDialog(input: {
    subscriptionId: number;
    subscriptionName: string;
    onPaymentRemoved: (paymentId: number) => void;
  }): Observable<any> {
    const formData: SubscriptionPaymentHistoryFormData = {
      ...input,
      onLoadHistory: (callback: (items: any[]) => void) => {
        this.getPaymentHistory(input.subscriptionId).subscribe({
          next:  (res) => callback(res.data ?? []),
          error: () => callback([]),
        });
      },
      close:     () => {},
      isValid:   () => true,
      getResult: () => null,
      reset:     () => {},
    };
    const dialogData: DialogData = {
      header:         `Payment History — ${input.subscriptionName}`,
      component:      SubscriptionPaymentHistoryComponent,
      data:           formData,
      validationData: formData,
      buttons:        [DialogButton.CLOSE],
      validate:       () => true,
    };
    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width:     '640px',
      maxHeight: '80vh',
      data:      dialogData,
    });
    formData.close = () => dialogRef.close();
    return dialogRef.afterClosed();
  }

  showPriceHistoryDialog(input: {
    subscriptionId: number;
    subscriptionName: string;
    currencyConversion: number;
  }): Observable<any> {
    const formData: SubscriptionPriceHistoryFormData = {
      ...input,
      onLoadPriceHistory: (callback: (items: PriceHistoryItem[]) => void) => {
        this.getPriceHistory(input.subscriptionId).subscribe({
          next:  (res) => callback(res.data ?? []),
          error: () => callback([]),
        });
      },
      close:     () => {},
      isValid:   () => true,
      getResult: () => null,
      reset:     () => {},
    };
    const dialogData: DialogData = {
      header:         `Price History — ${input.subscriptionName}`,
      component:      SubscriptionPriceHistoryComponent,
      data:           formData,
      validationData: formData,
      buttons:        [DialogButton.CLOSE],
      validate:       () => true,
    };
    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '620px',
      data:  dialogData,
    });
    formData.close = () => dialogRef.close();
    return dialogRef.afterClosed();
  }

  showDeleteConfirmDialog(subscription: Subscription, onConfirmed: () => void): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title:        'Delete Subscription',
        message:      `Delete "${subscription.name}"? This will also remove all associated payment history records.`,
        confirmLabel: 'Delete',
        cancelLabel:  'Cancel',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) onConfirmed();
    });
  }
}
