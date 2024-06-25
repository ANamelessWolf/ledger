import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardListFilterComponent } from '@card/components/card-list-filter/card-list-filter.component';
import { CardPaymentFormComponent } from '@card/components/card-payment-form/card-payment-form.component';
import { CreditCardEditFormComponent } from '@card/components/credit-card-edit-form/credit-card-edit-form.component';
import {
  CARD_STATUS,
  CARD_STATUS_KEYS,
  CardFilter,
  CardFilterOptions,
  CardItem,
} from '@common/types/cardItem';
import {
  CreditCardPaymentRequest,
  CreditCardRequest,
} from '@common/types/cardPayment';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { APP_CATALOGS, LEDGER_API } from '@config/constants';
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

  updateCreditCard(req: CreditCardRequest): Observable<any> {
    return this.http.post(
      `${LEDGER_API.CREDIT_CARD}/${req.id}`,
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

  showEditCreditCardDialog(
    summary: CreditCardSummary,
    card: CardItem,
    formSubmitted: (request: CreditCardRequest) => void
  ) {
    const header: string = `Edit credit card ${summary.card} - ${summary.status.billing.period}`;
    const year = new Date().getFullYear() - 1;
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => year + x);
    const cardStatus = [
      CARD_STATUS.ACTIVE,
      CARD_STATUS.INACTIVE,
      CARD_STATUS.CANCELLED,
    ].map((st: CARD_STATUS) => {
      return { value: st, description: CARD_STATUS_KEYS[st] };
    });
    const dialogRef = this.dialog.open(CreditCardEditFormComponent, {
      width: '980px',
      data: {
        header: header,
        card: summary,
        item: card,
        options: {
          days: APP_CATALOGS.CARD_DAYS,
          months: APP_CATALOGS.CARD_MONTHS,
          years: years,
          colors: APP_CATALOGS.CARD_COLORS,
          status: cardStatus,
        },
        formSubmitted: formSubmitted,
      },
    });
    return dialogRef.afterClosed();
  }
}
