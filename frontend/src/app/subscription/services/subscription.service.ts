import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LEDGER_API } from '@config/constants';
import { Observable } from 'rxjs';
import {
  AddSubscription,
  AddPaymentDialogData,
  ExpenseSearchResult,
  PaymentHistoryDialogData,
  PriceHistoryDialogData,
  SubscriptionFormData,
  UpdateSubscription,
} from '@subscription/types/subscriptionTypes';
import { SubscriptionFormComponent } from '@subscription/components/subscription-form/subscription-form.component';
import { SubscriptionAddPaymentComponent } from '@subscription/components/subscription-add-payment/subscription-add-payment.component';
import { SubscriptionPaymentHistoryComponent } from '@subscription/components/subscription-payment-history/subscription-payment-history.component';
import { SubscriptionPriceHistoryComponent } from '@subscription/components/subscription-price-history/subscription-price-history.component';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

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

  showSubscriptionFormDialog(data: SubscriptionFormData) {
    const dialogRef = this.dialog.open(SubscriptionFormComponent, {
      width: '560px',
      data,
    });
    return dialogRef.afterClosed();
  }

  showAddPaymentDialog(data: Omit<AddPaymentDialogData, 'onSearchExpenses' | 'existingPayments'> & { existingPayments?: AddPaymentDialogData['existingPayments'] }) {
    const dialogRef = this.dialog.open(SubscriptionAddPaymentComponent, {
      width: '640px',
      maxHeight: '70vh',
      data: {
        ...data,
        existingPayments: data.existingPayments ?? [],
        onSearchExpenses: (description: string, callback: (results: ExpenseSearchResult[]) => void) => {
          this.searchExpenses(description).subscribe({
            next: (res) => callback(res.data ?? []),
            error: () => callback([]),
          });
        },
      } satisfies AddPaymentDialogData,
    });
    return dialogRef.afterClosed();
  }

  showPriceHistoryDialog(data: Omit<PriceHistoryDialogData, 'onLoadPriceHistory'>) {
    const dialogRef = this.dialog.open(SubscriptionPriceHistoryComponent, {
      width: '620px',
      data: {
        ...data,
        onLoadPriceHistory: (callback: (items: any[]) => void) => {
          this.getPriceHistory(data.subscriptionId).subscribe({
            next: (res) => callback(res.data ?? []),
            error:() => callback([]),
          });
        },
      } satisfies PriceHistoryDialogData,
    });
    return dialogRef.afterClosed();
  }

  showPaymentHistoryDialog(data: Omit<PaymentHistoryDialogData, 'onLoadHistory'>) {
    const dialogRef = this.dialog.open(SubscriptionPaymentHistoryComponent, {
      width: '640px',
      maxHeight: '80vh',
      data: {
        ...data,
        onLoadHistory: (callback: (items: any[]) => void) => {
          this.getPaymentHistory(data.subscriptionId).subscribe({
            next: (res) => callback(res.data ?? []),
            error: () => callback([]),
          });
        },
      } satisfies PaymentHistoryDialogData,
    });
    return dialogRef.afterClosed();
  }
}
