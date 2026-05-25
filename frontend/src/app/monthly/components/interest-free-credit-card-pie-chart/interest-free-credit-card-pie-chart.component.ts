import { CommonModule, DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ICardValue } from '@moNoInt/types/monthlyNoInterest';
import { toCurrency } from '@common/utils/formatUtils';
import { Chart } from 'chart.js';

const CHART_COLORS = [
  '#087e8b', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#10b981', // emerald
  '#f97316', // orange
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // cyan
  '#6366f1', // indigo
];

@Component({
  selector: 'app-interest-free-credit-card-pie-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './interest-free-credit-card-pie-chart.component.html',
  styleUrl: './interest-free-credit-card-pie-chart.component.scss',
})
export class InterestFreeCreditCardPieChartComponent implements AfterViewInit, OnChanges {
  @Input() cards: ICardValue[] = [];
  @Input() size: string = '160px';

  private chart: Chart | null = null;

  ngAfterViewInit(): void { this.createChart(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards'] && this.chart) { this.refreshChart(); }
  }

  getColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length];
  }

  private createChart(): void {
    const canvas = document.getElementById('cardChartPieChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: this.buildChartData(),
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${toCurrency(this.cards[item.dataIndex]?.balance ?? 0)}`,
            },
          },
        },
      },
    });
  }

  private refreshChart(): void {
    if (!this.chart) return;
    this.chart.data = this.buildChartData();
    this.chart.update();
  }

  private buildChartData() {
    return {
      labels: this.cards.map(c => c.card),
      datasets: [{
        data:            this.cards.map(c => c.value),
        backgroundColor: this.cards.map((_, i) => this.getColor(i)),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  }
}
