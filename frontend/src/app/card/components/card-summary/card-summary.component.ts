import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  CardItem,
  EMPTY_CARD_ITEM,
  PAYMENT_STATUS,
} from '@common/types/cardItem';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { DebitCardSummary } from '@common/types/debitCardSummary';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { CreditCardOverviewComponent } from '../credit-card-overview/credit-card-overview.component';
import { DebitCardOverviewComponent } from '../debit-card-overview/debit-card-overview.component';
import { CardPaymentFormComponent } from '../card-payment-form/card-payment-form.component';
import { CommonDialogService } from '@common/services/common-dialog.service';
import { CardService } from '@card/services/card.service';
import { NotificationService } from '@common/services/notification.service';
import { INFO_MSG, TOOL_TIP } from '@config/messages';
import {
  CreditCardPaymentRequest,
  CreditCardRequest,
  DebitCardRequest,
} from '@common/types/cardPayment';
import { Router } from '@angular/router';
import { CARD_BASE } from '@card/card.routes';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-card-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CreditCardOverviewComponent,
    DebitCardOverviewComponent,
    CardPaymentFormComponent,
    MatTooltipModule,
  ],
  providers: [CommonDialogService],
  templateUrl: './card-summary.component.html',
  styleUrl: './card-summary.component.scss',
})
export class CardSummaryComponent {
  @Input() card: CardItem = EMPTY_CARD_ITEM;
  @Input() summary: CreditCardSummary | DebitCardSummary | null = null;
  visibility: boolean = true;

  //Toolbox
  positionOptions: TooltipPosition = 'below';
  tool_tip_position = new FormControl(this.positionOptions);
  tool_tip_delay: string = '3000';
  tooltips = {
    add_pay: TOOL_TIP.ADD_PAY,
    edit: TOOL_TIP.EDIT_CARD,
  };

  constructor(
    private cardService: CardService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  refreshPage() {
    let url = `/${CARD_BASE}}`;
    if (this.card.isCreditCard) {
      url = `/${CARD_BASE}/cc/${this.card.id}`;
    } else if (!this.card.isCreditCard) {
      url = `/${CARD_BASE}/dc/${this.card.id}`;
    }
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([url]);
    });
  }

  changeVisibility() {
    this.visibility = !this.visibility;
  }

  addCardPayment() {
    const ccSumary = this.summary as CreditCardSummary;
    if (ccSumary.status.status === PAYMENT_STATUS.NOT_REQUIRED) {
      this.notifService.showNotification(INFO_MSG.PAY_N_REQ, 'info');
    } else {
      this.cardService
        .showAddCreditCardPayDialog(ccSumary, this.sumbitPayment.bind(this))
        .subscribe();
    }
  }

  sumbitPayment(request: CreditCardPaymentRequest) {
    this.cardService.addPaymetToCreditCard(request).subscribe(
      (response) => {
        this.notifService.showNotification(INFO_MSG.PAY_ADDED, 'success');
        this.refreshPage();
      },
      (err: HttpErrorResponse) => {
        this.notifService.showError(err);
      }
    );
  }

  get creditCardSummary(): CreditCardSummary {
    return this.summary as CreditCardSummary;
  }

  get debitCardSummary(): DebitCardSummary {
    return this.summary as DebitCardSummary;
  }

  editCard() {
    const card: CardItem = this.card;
    if (this.card.isCreditCard) {
      const summary: CreditCardSummary = this.summary as CreditCardSummary;
      this.cardService
        .showEditCreditCardDialog(summary, card, this.sumbitCreditCard.bind(this))
        .subscribe();
    } else {
      const summary: DebitCardSummary = this.summary as DebitCardSummary;
      this.cardService
        .showEditDebitCardDialog(summary, card, this.sumbitDebitCard.bind(this))
        .subscribe();
    }
  }

  sumbitCreditCard(request: CreditCardRequest) {
    this.cardService.updateCreditCard(request).subscribe(
      (response) => {
        this.notifService.showNotification(INFO_MSG.PAY_ADDED, 'success');
        this.refreshPage();
      },
      (err: HttpErrorResponse) => {
        this.notifService.showError(err);
      }
    );
  }

  sumbitDebitCard(request: DebitCardRequest) {
    this.cardService.updateDebitCard(request).subscribe(
      (response) => {
        this.notifService.showNotification(INFO_MSG.PAY_ADDED, 'success');
        this.refreshPage();
      },
      (err: HttpErrorResponse) => {
        this.notifService.showError(err);
      }
    );
  }

}
