import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import {
  DEFAULT_MO_NO_INT_FILTER,
  InstallmentPayment,
  MoNoIntFilter,
  MoNoIntFilterDialogData,
  MoNoIntSearchOptions,
} from '@moNoInt/types/monthlyNoInterest';
import { MoNoIntFilterDialogComponent } from '@moNoInt/components/mo-no-int-filter-dialog/mo-no-int-filter-dialog.component';
import { LEDGER_API } from '@config/constants';
import { Pagination, SortType } from '@config/commonTypes';
import { QueryBuilder } from '@common/utils/filterUtils';
import { PaymentListComponent } from '@moNoInt/components/payment-list/payment-list.component';
import { MonthlyAddWizardComponent } from '@moNoInt/components/monthly-add-wizard/monthly-add-wizard.component';
import {
  MonthlyWizardDialogData,
  MonthlyWizardPayload,
} from '@moNoInt/types/monthlyAddWizard.types';

@Injectable({
  providedIn: 'root',
})
export class MoNoIntService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  getNonIntMonthlyInstallments(options: MoNoIntSearchOptions): Observable<any> {
    const { pagination, sorting, filter } = options;
    const query = this.getQueryString(pagination, filter, sorting);
    return this.http.get(`${LEDGER_API.MO_NO_INT}?${query}`);
  }

  getPayments(installmentId: Number): Observable<any> {
    return this.http.get(`${LEDGER_API.MO_NO_INT}/payments/${installmentId}`);
  }

  payInstallment(installmentId: Number, paymentId: Number): Observable<any> {
    const body = { id: installmentId, paymentId: paymentId };
    return this.http.put(`${LEDGER_API.MO_NO_INT}/pay`, body);
  }

  getWalletGroups(): Observable<any> {
    return this.http.get(`${LEDGER_API.CATALOG}/wallet-groups`);
  }

  getCreditCardsForWizard(): Observable<any> {
    return this.http.get(`${LEDGER_API.MO_NO_INT}/credit-cards`);
  }

  getWalletsByGroup(walletGroupId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.MO_NO_INT}/wallets/${walletGroupId}`);
  }

  searchExpensesForInstallment(walletGroupId: number, description: string): Observable<any> {
    return this.http.get(
      `${LEDGER_API.MO_NO_INT}/search-expenses?walletGroupId=${walletGroupId}&description=${encodeURIComponent(description)}`
    );
  }

  createInstallment(payload: MonthlyWizardPayload): Observable<any> {
    return this.http.post(`${LEDGER_API.MO_NO_INT}`, payload);
  }

  // Dialogs
  showPaymentsDialog(
    header: string,
    payments: InstallmentPayment[],
    installmentId: Number,
    onClose: () => void
  ) {
    const dialogRef = this.dialog.open(PaymentListComponent, {
      width: '800px',
      data: {
        header: header,
        installmentId: installmentId,
        payments: payments,
        pay: (installmentId: Number, paymentId: Number) => {
          return this.payInstallment(installmentId, paymentId);
        },
        onClose: onClose,
      },
    });
    return dialogRef.afterClosed();
  }

  showAddWizardDialog(onCreated: () => void) {
    forkJoin({
      cards: this.getCreditCardsForWizard(),
      expenseTypes: this.http.get(`${LEDGER_API.CATALOG}/expenseTypes`),
      vendors: this.http.get(`${LEDGER_API.CATALOG}/vendors`),
    }).subscribe({
      next: ({ cards, expenseTypes, vendors }: any) => {
        const data: MonthlyWizardDialogData = {
          creditCards: cards.data ?? [],
          expenseTypes: expenseTypes.data ?? [],
          vendors: vendors.data ?? [],
          onLoadWallets: (walletGroupId, callback) => {
            this.getWalletsByGroup(walletGroupId).subscribe({
              next: (res: any) => callback(res.data ?? []),
              error: () => callback([]),
            });
          },
          onSearchExpenses: (walletGroupId, description, callback) => {
            this.searchExpensesForInstallment(walletGroupId, description).subscribe({
              next: (res: any) => callback(res.data ?? []),
              error: () => callback([]),
            });
          },
          onConfirm: (payload: MonthlyWizardPayload) => {
            this.createInstallment(payload).subscribe({
              next: () => onCreated(),
              error: (err) => console.error('Error creating installment', err),
            });
          },
        };

        this.dialog.open(MonthlyAddWizardComponent, {
          width: '760px',
          maxHeight: '90vh',
          data,
          disableClose: true,
        });
      },
    });
  }

  showFilterDialog(current: MoNoIntFilter, onApply: (filter: MoNoIntFilter) => void): void {
    forkJoin({
      walletGroups: this.http.get<any>(`${LEDGER_API.CATALOG}/wallet-groups`),
    }).subscribe(({ walletGroups }) => {
      const data: MoNoIntFilterDialogData = {
        current: { ...current },
        walletGroups: walletGroups.data ?? [],
      };
      this.dialog
        .open(MoNoIntFilterDialogComponent, { width: '420px', data })
        .afterClosed()
        .subscribe((result: MoNoIntFilter | null) => {
          if (result !== null && result !== undefined) {
            onApply(result);
          }
        });
    });
  }

  private getQueryString = (
    pagination: Pagination,
    filter: MoNoIntFilter,
    sorting?: SortType
  ): string => {
    const query = new QueryBuilder();

    // Pagination
    query.addPagination(pagination);

    // Filter
    query.appendArrFilterProp('creditcardId', filter.creditCard);
    query.appendFilterProperty('status', filter.status);
    query.appendFilterProperty('fromMonth', filter.fromMonth);
    query.appendFilterProperty('fromYear', filter.fromYear);
    query.appendFilterProperty('toMonth', filter.toMonth);
    query.appendFilterProperty('toYear', filter.toYear);
    query.appendFilterProperty('walletGroupId', filter.walletGroupId);

    // Sorting
    query.addSorting(sorting);
    return query.queryAsString;
  };
}
