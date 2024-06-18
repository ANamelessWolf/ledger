import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { DebitCardSummary } from '@common/types/debitCardSummary';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CreditCardOverviewComponent } from '../credit-card-overview/credit-card-overview.component';
import { DebitCardOverviewComponent } from '../debit-card-overview/debit-card-overview.component';

@Component({
  selector: 'app-card-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CreditCardOverviewComponent,
    DebitCardOverviewComponent
  ],
  templateUrl: './card-summary.component.html',
  styleUrl: './card-summary.component.scss',
})
export class CardSummaryComponent {
  @Input() card: CardItem = EMPTY_CARD_ITEM;
  @Input() summary: CreditCardSummary | DebitCardSummary | null = null;
  visibility: boolean = true;

  changeVisibility() {
    this.visibility = !this.visibility;
  }

  addCardPayment() {}

  get creditCardSummary(): CreditCardSummary {
    return this.summary as CreditCardSummary;
  }

  get debitCardSummary(): DebitCardSummary {
    return this.summary as DebitCardSummary;
  }
}
