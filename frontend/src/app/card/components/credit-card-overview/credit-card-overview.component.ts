import { Component, Input } from '@angular/core';
import {
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SUMMARY,
} from '@common/types/creditCardSummary';

@Component({
  selector: 'app-credit-card-overview',
  standalone: true,
  imports: [],
  templateUrl: './credit-card-overview.component.html',
  styleUrl: './credit-card-overview.component.scss',
})
export class CreditCardOverviewComponent {
  @Input() summary: CreditCardSummary = EMPTY_CREDIT_CARD_SUMMARY;

  get endingCard(): string {
    if (this.summary.banking === 'American Express') {
      return `XXXX XXXXXX ${this.summary.ending}`;
    }
    return `XXXX XXXX XXXX ${this.summary.ending}`;
  }
}
