import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardListFilterComponent } from '@card/components/card-list-filter/card-list-filter.component';
import { CardPaymentFormComponent } from '@card/components/card-payment-form/card-payment-form.component';
import { CardFilter, CardFilterOptions } from '@common/types/cardItem';
import { CreditCardPaymentRequest } from '@common/types/cardPayment';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { LEDGER_API } from '@config/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  getCreditCardSummaryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.CREDIT_CARD}/summary/${id}`);
  }

  getDebitCardSummaryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.DEBIT_CARD}/summary/${id}`);
  }

  addPaymetToCreditCard(req: CreditCardPaymentRequest): Observable<any> {
    return this.http.put(
      `${LEDGER_API.CREDIT_CARD}/payCreditcard/${req.id}`,
      req.body
    );
  }

  // Dialogs
  showCardFilterDialog(
    options: CardFilterOptions,
    filterSelected: (filter: CardFilter) => void
  ) {
    const header: string = 'Card Filters';
    const dialogRef = this.dialog.open(CardListFilterComponent, {
      width: '600px',
      data: {
        header: header,
        options: options,
        filterSelected: filterSelected,
      },
    });
    return dialogRef.afterClosed();
  }

  showAddCreditCardPayDialog(
    summary: CreditCardSummary,
    formSubmitted: (request: CreditCardPaymentRequest) => void
  ) {
    const header: string = `Add payment to ${summary.card} - ${summary.status.billing.period}`;
    const dialogRef = this.dialog.open(CardPaymentFormComponent, {
      width: '600px',
      data: {
        header: header,
        card: summary,
        formSubmitted: formSubmitted,
      },
    });
    return dialogRef.afterClosed();
  }
}
