import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { round, toCurrency, toNumber } from '@common/utils/formatUtils';
import { Chart, registerables } from 'chart.js';
import {
  CardSpending,
  CreditCardSpending,
  EMPTY_CREDIT_CARD_SPENDING,
} from '@common/types/creditCardSummary';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';

const ticksFormat = (value: string | number) => {
  return typeof value === 'number' ? toCurrency(value) : value;
};

@Component({
  selector: 'app-credit-card-spending-chart',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './credit-card-spending-chart.component.html',
  styleUrl: './credit-card-spending-chart.component.scss',
})
export class CreditCardSpendingChartComponent {
  @Input() cardSpending: CreditCardSpending = EMPTY_CREDIT_CARD_SPENDING;
  @Input() sizeWidth: string = '70%';
  @Input() sizeHeight: string = '400px';
  private chart!: any;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardSpending']) {
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
    const canvas = document.getElementById(
      'creditCardSpendingChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('ccSpendingChartContainer');
    if (ctx !== null && container !== null) {
      const bounds = container?.getBoundingClientRect();
      canvas.width = bounds.width * 0.6;
      canvas.height = canvas.width * (9 / 16);
      // ctx.scale(devicePixelRatio, devicePixelRatio);
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: this.getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#94a3b8',
              bodyColor: '#f1f5f9',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (item: any) => ` ${toCurrency(item.raw as number)}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.04)' },
              border: { display: false },
              ticks: { color: '#94a3b8', callback: ticksFormat },
            },
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { color: '#64748b' },
            },
          },
        },
      });
    }
  }

  private cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  public getColor(value: number, average: number) {
    if (value <= average * 1.1) return this.cssVar('--color-green-fill');
    if (value < average * 1.4)  return this.cssVar('--color-yellow-fill');
    return this.cssVar('--color-red-fill');
  }

  public getBorderColor(value: number, average: number) {
    if (value <= average * 1.1) return this.cssVar('--color-green');
    if (value < average * 1.4)  return this.cssVar('--color-yellow');
    return this.cssVar('--color-red');
  }

  private getChartData() {
    const average = toNumber(this.cardSpending.average);
    return {
      labels: this.cardSpending.spending.map((x) => x.label),
      datasets: [
        {
          label: 'Spending',
          data: this.cardSpending.spending.map((x) => x.spending),
          backgroundColor: this.cardSpending.spending.map((x) =>
            this.getColor(x.spending, average)
          ),
          borderColor: this.cardSpending.spending.map((x) =>
            this.getBorderColor(x.spending, average)
          ),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }

  get total() {
    if (
      this.cardSpending &&
      this.cardSpending.spending &&
      this.cardSpending.spending.length === 0
    ) {
      return 0;
    }
    const spending: CardSpending[] = this.cardSpending.spending;
    const total = spending.map((x) => x.spending).reduce((pv, cv) => pv + cv);
    return total;
  }
}
