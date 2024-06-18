import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SUMMARY,
} from '@common/types/creditCardSummary';
import { round, toNumber } from '@common/utils/formatUtils';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-credit-card-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-card-chart.component.html',
  styleUrl: './credit-card-chart.component.scss',
})
export class CreditCardChartComponent implements OnInit, OnChanges {
  @Input() summary: CreditCardSummary = EMPTY_CREDIT_CARD_SUMMARY;
  @Input() size: string = '250px';
  private chart!: any;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.getChartData();
      this.chart.update();
    }
  }

  private createChart(): void {
    const ctx = (
      document.getElementById('creditCardChart') as HTMLCanvasElement
    ).getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: this.getChartData(),
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) =>
                `${tooltipItem.label}: ${tooltipItem.raw}%`,
            },
          },
        },
      },
    });
  }

  private getChartData() {
    const usedCredit = this.summary ? toNumber(this.summary.usedCredit) : 0;
    const limitCredit = this.summary ? toNumber(this.summary.credit) : 0;
    let usedPercentage = round((usedCredit / limitCredit) * 100);
    let remainingPercentage = round(100 - usedPercentage);

    let backgroundColor;
    if (usedCredit < 0) {
      remainingPercentage = (limitCredit + usedCredit * -1) / limitCredit;
      remainingPercentage = round(remainingPercentage * 100);
      usedPercentage = 0;
      backgroundColor = ['black', '#beb9ef'];
    } else {
      if (usedPercentage < 40) {
        backgroundColor = ['greenyellow', '#beb9ef'];
      } else if (usedPercentage >= 40 && usedPercentage < 75) {
        backgroundColor = ['gold', '#beb9ef'];
      } else {
        backgroundColor = ['#ff3c3c', '#beb9ef'];
      }
    }

    return {
      labels: ['Expenses', 'Available balance'],
      datasets: [
        {
          data: [usedPercentage, remainingPercentage],
          backgroundColor,
        },
      ],
    };
  }
}
