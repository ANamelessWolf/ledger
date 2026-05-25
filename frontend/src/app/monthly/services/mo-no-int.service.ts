import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, tap } from 'rxjs';
import {
  DEFAULT_MO_NO_INT_FILTER,
  InstallmentPayment,
  MoNoIntFilter,
  MoNoIntSearchOptions,
} from '@moNoInt/types/monthlyNoInterest';
import { MoNoIntFilterDialogComponent, MoNoIntFilterFormData } from '@moNoInt/components/mo-no-int-filter-dialog/mo-no-int-filter-dialog.component';
import { PaymentListComponent, PaymentListFormData } from '@moNoInt/components/payment-list/payment-list.component';
import { MonthlyAddWizardComponent } from '@moNoInt/components/monthly-add-wizard/monthly-add-wizard.component';
import { MonthlyWizardFormData, MonthlyWizardPayload } from '@moNoInt/types/monthlyAddWizard.types';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { CatalogItem } from '@common/types/catalogTypes';
import { LEDGER_API } from '@config/constants';
import { Pagination, SortType } from '@config/commonTypes';
import { QueryBuilder } from '@common/utils/filterUtils';

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

  getPayments(installmentId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.MO_NO_INT}/payments/${installmentId}`);
  }

  payInstallment(installmentId: number, paymentId: number): Observable<any> {
    return this.http.put(`${LEDGER_API.MO_NO_INT}/pay`, { id: installmentId, paymentId });
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

  // ── Dialogs ───────────────────────────────────────────────

  showPaymentsDialog(
    header: string,
    payments: InstallmentPayment[],
    installmentId: number,
    onClose: () => void
  ): Observable<any> {
    const payData: PaymentListFormData = {
      installmentId,
      payments,
      pay: (iId, pId) => this.payInstallment(iId, pId),
      isValid:   () => true,
      getResult: () => null,
    };

    const dialogData: DialogData = {
      header,
      component: PaymentListComponent,
      data: payData,
      validationData: payData,
      buttons: [DialogButton.CLOSE],
      validate: () => true,
    };

    return this.dialog
      .open(DialogWrapperComponent, { width: '680px', data: dialogData })
      .afterClosed()
      .pipe(tap(() => onClose()));
  }

  showFilterDialog(
    current: MoNoIntFilter,
    walletGroups: CatalogItem[],
    onApply: (filter: MoNoIntFilter) => void
  ): void {
    const filterData: MoNoIntFilterFormData = {
      current: { ...current },
      walletGroups,
      isValid:   () => true,
      getResult: () => ({ ...DEFAULT_MO_NO_INT_FILTER }),
      reset:     () => {},
    };

    const dialogData: DialogData = {
      header: 'Filtrar mensualidades',
      component: MoNoIntFilterDialogComponent,
      data: filterData,
      validationData: filterData,
      buttons: [DialogButton.CLEAR, DialogButton.CANCEL, DialogButton.APPLY],
      validate: () => true,
      onClear: () => filterData.reset(),
    };

    this.dialog
      .open(DialogWrapperComponent, { width: '440px', data: dialogData })
      .afterClosed()
      .subscribe((result: any) => {
        if (result?.button === DialogButton.APPLY) {
          onApply(filterData.getResult());
        }
      });
  }

  showAddWizardDialog(onCreated: () => void): void {
    forkJoin({
      cards:        this.getCreditCardsForWizard(),
      expenseTypes: this.http.get(`${LEDGER_API.CATALOG}/expenseTypes`),
      vendors:      this.http.get(`${LEDGER_API.CATALOG}/vendors`),
    }).subscribe({
      next: ({ cards, expenseTypes, vendors }: any) => {
        const wizardData: MonthlyWizardFormData = {
          creditCards:  cards.data        ?? [],
          expenseTypes: expenseTypes.data ?? [],
          vendors:      vendors.data      ?? [],
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
          close:     () => {},
          isValid:   () => true,
          getResult: () => null,
          reset:     () => {},
        };

        const dialogData: DialogData = {
          header:         'Nueva mensualidad sin intereses',
          component:      MonthlyAddWizardComponent,
          data:           wizardData,
          validationData: wizardData,
          buttons:        [DialogButton.CANCEL],
          validate:       () => true,
        };

        const dialogRef = this.dialog.open(DialogWrapperComponent, {
          width:        '780px',
          maxHeight:    '90vh',
          data:         dialogData,
          disableClose: true,
        });

        wizardData.close = () => dialogRef.close();
      },
    });
  }

  private getQueryString = (
    pagination: Pagination,
    filter: MoNoIntFilter,
    sorting?: SortType
  ): string => {
    const query = new QueryBuilder();
    query.addPagination(pagination);
    query.appendArrFilterProp('creditcardId', filter.creditCard);
    query.appendFilterProperty('status', filter.status);
    query.appendFilterProperty('fromMonth', filter.fromMonth);
    query.appendFilterProperty('fromYear', filter.fromYear);
    query.appendFilterProperty('toMonth', filter.toMonth);
    query.appendFilterProperty('toYear', filter.toYear);
    query.appendFilterProperty('walletGroupId', filter.walletGroupId);
    query.addSorting(sorting);
    return query.queryAsString;
  };
}
