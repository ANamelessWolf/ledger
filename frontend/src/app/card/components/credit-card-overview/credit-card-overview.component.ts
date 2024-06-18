import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SUMMARY,
} from '@common/types/creditCardSummary';
import { CardMiniatureComponent } from '@card/components/card-miniature/card-miniature.component';
('../card-miniature/card-miniature.component');
import { CommonModule } from '@angular/common';
import { CreditCardChartComponent } from '../credit-card-chart/credit-card-chart.component';

@Component({
  selector: 'app-credit-card-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardMiniatureComponent,
    MatGridListModule,
    CreditCardChartComponent,
  ],
  templateUrl: './credit-card-overview.component.html',
  styleUrl: './credit-card-overview.component.scss',
})
export class CreditCardOverviewComponent {
  @Input() summary: CreditCardSummary = EMPTY_CREDIT_CARD_SUMMARY;
  chartSize = "300px";
}
