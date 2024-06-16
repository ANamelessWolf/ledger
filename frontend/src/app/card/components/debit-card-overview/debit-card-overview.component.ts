import { Component, Input } from '@angular/core';
import {
  DebitCardSummary,
  EMPTY_DEBIT_CARD_SUMMARY,
} from '@common/types/debitCardSummary';

@Component({
  selector: 'app-debit-card-overview',
  standalone: true,
  imports: [],
  templateUrl: './debit-card-overview.component.html',
  styleUrl: './debit-card-overview.component.scss',
})
export class DebitCardOverviewComponent {
  @Input() summary: DebitCardSummary = EMPTY_DEBIT_CARD_SUMMARY;
}
