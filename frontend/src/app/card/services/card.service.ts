import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardListFilterComponent, CardFilterDialogData } from '@card/components/card-list-filter/card-list-filter.component';
import { CreditCardEditFormComponent, CreditCardEditData } from '@card/components/credit-card-edit-form/credit-card-edit-form.component';
import { CardPaymentFormComponent, CardPaymentData } from '@card/components/card-payment-form/card-payment-form.component';
import { DebitCardEditFormComponent } from '@card/components/debit-card-edit-form/debit-card-edit-form.component';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogButton } from '@config/enums';

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
  DebitCardRequest,
} from '@common/types/cardPayment';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { DebitCardSummary } from '@common/types/debitCardSummary';
import { APP_CATALOGS, LEDGER_API } from '@config/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { DateRange } from '@expense/types/expensesTypes';
import { generateCardPeriods } from '@common/utils/dateUtils';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private _cardPeriods$ = new BehaviorSubject<Map<string, DateRange>>(new Map());
  private _currentPeriodKey$ = new BehaviorSubject<string>('');
  readonly cardPeriods$ = this._cardPeriods$.asObservable();
  readonly currentPeriodKey$ = this._currentPeriodKey$.asObservable();

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  updateCardPeriods(period: DateRange): void {
    const { periods, currentKey } = generateCardPeriods(period);
    this._cardPeriods$.next(periods);
    this._currentPeriodKey$.next(currentKey);
  }

  getCreditCardSummaryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.CREDIT_CARD}/summary/${id}`);
  }

  getCreditCardSpendingHistoryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.CREDIT_CARD}/spending/${id}`);
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

  updateDebitCard(req: DebitCardRequest): Observable<any> {
    return this.http.post(
      `${LEDGER_API.DEBIT_CARD}/${req.id}`,
      req.body
    );
  }

  // Dialogs
  showCardFilterDialog(
    options: CardFilterOptions,
    filterSelected: (filter: CardFilter) => void
  ) {
    const innerData: CardFilterDialogData = {
      options,
      getFilter: null,
      _clearFn: null,
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '460px',
      data: {
        header: 'Card Filters',
        component: CardListFilterComponent,
        data: innerData,
        buttons: [DialogButton.CLEAR, DialogButton.CLOSE, DialogButton.APPLY],
        validationData: null,
        validate: () => true,
        onClear: () => innerData._clearFn?.(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.button === DialogButton.APPLY && innerData.getFilter) {
        filterSelected(innerData.getFilter());
      }
    });

    return dialogRef.afterClosed();
  }

  showAddCreditCardPayDialog(
    summary: CreditCardSummary,
    formSubmitted: (request: CreditCardPaymentRequest) => void
  ) {
    const innerData: CardPaymentData = {
      card: summary,
      isValid: () => false,
      getResult: () => ({ id: 0, body: {} as any }),
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '480px',
      data: {
        header: `Add payment to ${summary.card} - ${summary.status.billing.period}`,
        component: CardPaymentFormComponent,
        data: innerData,
        buttons: [DialogButton.CLOSE, DialogButton.SUBMIT],
        validationData: null,
        validate: () => innerData.isValid(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.button === DialogButton.SUBMIT) {
        formSubmitted(innerData.getResult());
      }
    });

    return dialogRef.afterClosed();
  }

  showEditCreditCardDialog(
    summary: CreditCardSummary,
    card: CardItem,
    formSubmitted: (request: CreditCardRequest) => void
  ) {
    const year = new Date().getFullYear() - 1;
    const innerData: CreditCardEditData = {
      card: summary,
      item: card,
      options: {
        days: APP_CATALOGS.CARD_DAYS,
        months: APP_CATALOGS.CARD_MONTHS,
        years: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => year + x),
        colors: APP_CATALOGS.CARD_COLORS,
        status: [CARD_STATUS.ACTIVE, CARD_STATUS.INACTIVE, CARD_STATUS.CANCELLED]
          .map((st) => ({ value: st, description: CARD_STATUS_KEYS[st] })),
      },
      isValid: () => false,
      getResult: () => ({ id: 0, body: {} as any }),
    };

    const dialogRef = this.dialog.open(DialogWrapperComponent, {
      width: '680px',
      data: {
        header: `Edit ${summary.card} - ${summary.status.billing.period}`,
        component: CreditCardEditFormComponent,
        data: innerData,
        buttons: [DialogButton.CLOSE, DialogButton.SAVE],
        validationData: null,
        validate: () => innerData.isValid(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.button === DialogButton.SAVE) {
        formSubmitted(innerData.getResult());
      }
    });

    return dialogRef.afterClosed();
  }

  showEditDebitCardDialog(
    summary: DebitCardSummary,
    card: CardItem,
    formSubmitted: (request: DebitCardRequest) => void
  ) {
    const header: string = `Edit ${summary.card}`;
    const year = new Date().getFullYear() - 1;
    const years = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => year + x);
    const cardStatus = [
      CARD_STATUS.ACTIVE,
      CARD_STATUS.INACTIVE,
      CARD_STATUS.CANCELLED,
    ].map((st: CARD_STATUS) => {
      return { value: st, description: CARD_STATUS_KEYS[st] };
    });
    const dialogRef = this.dialog.open(DebitCardEditFormComponent, {
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
