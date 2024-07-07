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
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: ticksFormat,
              },
            },
          },
        },
      });
    }
  }

  public getColor(value: number, average: number) {
    if (value <= average * 1.1) {
      return 'greenyellow';
    } else if (value > average * 1.1 && value < average * 1.4) {
      return 'gold';
    } else {
      return '#ff3c3c';
    }
  }
  public getBorderColor(value: number, average: number) {
    if (value <= average * 1.1) {
      return '#beb9ef';
    } else if (value > average * 1.1 && value < average * 1.4) {
      return '#beb9ef';
    } else {
      return '#beb9ef';
    }
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
