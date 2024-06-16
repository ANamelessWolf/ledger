import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { DebitCardSummary } from '@common/types/debitCardSummary';

@Component({
  selector: 'app-card-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-summary.component.html',
  styleUrl: './card-summary.component.scss',
})
export class CardSummaryComponent {
  @Input() card: CardItem = EMPTY_CARD_ITEM;
  @Input() summary: CreditCardSummary | DebitCardSummary | null = null;
}
