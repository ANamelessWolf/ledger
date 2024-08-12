import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ICardValue } from '@moNoInt/types/monthlyNoInterest';
import { Chart } from 'chart.js';
import { round, toCurrency, toNumber } from '@common/utils/formatUtils';
import { MatCardModule } from '@angular/material/card';
import { ChartData, IChartComponent } from '@expense/types/ChartComponent';
import { createDoughnutChart, getContext, refreshChart } from '@expense/utils/chartUtils';
@Component({
  selector: 'app-interest-free-credit-card-pie-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './interest-free-credit-card-pie-chart.component.html',
  styleUrl: './interest-free-credit-card-pie-chart.component.scss',
})
export class InterestFreeCreditCardPieChartComponent
  implements OnInit, OnChanges, IChartComponent
{
  @Input() cards: ICardValue[] = [];
  @Input() size: string = '200px';
  chart!: any;
  chartContainer: string = 'cardChartPieChart';

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    refreshChart(this);
  }

  createChart(): void {
    const ctx = getContext(this);
    this.chart = createDoughnutChart(ctx, this);
  }

  getChartData(): ChartData {
    this.cards = [
      { card: 'AMEX', color: 'grey', value: 20 },
      { card: 'RAPPI', color: 'black', value: 30 },
      { card: 'BBVA', color: 'blue', value: 50 },
    ];
    const backgroundColor: string[] = [];
    const labels: string[] = [];
    const data: number[] = [];
    for (let index = 0; index < this.cards.length; index++) {
      const card = this.cards[index];
      backgroundColor.push(card.color);
      labels.push(card.card);
      data.push(card.value);
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
        },
      ],
    };
  }
}
