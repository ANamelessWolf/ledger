import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  InstallmentPayment,
  MoNoIntFilter,
  MoNoIntSearchOptions,
} from '@moNoInt/types/monthlyNoInterest';
import { LEDGER_API } from '@config/constants';
import { Pagination, SortType } from '@config/commonTypes';
import { QueryBuilder } from '@common/utils/filterUtils';
import { PaymentListComponent } from '@moNoInt/components/payment-list/payment-list.component';

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
    query.appendFilterProperty('archived', filter.archived);

    // Sorting
    query.addSorting(sorting);
    return query.queryAsString;
  };
}
