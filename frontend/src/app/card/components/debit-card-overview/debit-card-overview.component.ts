import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  DebitCardSummary,
  EMPTY_DEBIT_CARD_SUMMARY,
} from '@common/types/debitCardSummary';
import { CardMiniatureComponent } from '@card/components/card-miniature/card-miniature.component';

@Component({
  selector: 'app-debit-card-overview',
  standalone: true,
  imports: [CommonModule, CardMiniatureComponent, MatGridListModule],
  templateUrl: './debit-card-overview.component.html',
  styleUrl: './debit-card-overview.component.scss',
})
export class DebitCardOverviewComponent {
  @Input() summary: DebitCardSummary = EMPTY_DEBIT_CARD_SUMMARY;
}
