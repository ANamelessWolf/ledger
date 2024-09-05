import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { toCurrency } from '@common/utils/formatUtils';
import {
  ChartData,
  ChartDataSet,
  EMPTY_CHART_DATA,
} from '@expense/types/chartComponent';
import { Chart } from 'chart.js';

const ticksFormat = (value: string | number) => {
  return typeof value === 'number' ? toCurrency(value) : value;
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() data: ChartData = EMPTY_CHART_DATA;
  @Input() chartHeight: number = 300;
  private chart!: any;
  private chartContainer: string = 'lineChart';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateChart();
    }
  }

  ngOnInit(): void {
    this.createChart();
  }

  private getContext(): CanvasRenderingContext2D {
    const ctx = (
      document.getElementById(this.chartContainer) as HTMLCanvasElement
    ).getContext('2d')!;
    return ctx;
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.getChartData();
      this.chart.update();
    }
  }

  private createChart(): void {
    const ctx = this.getContext();
    if (ctx !== null) {
      this.chart = new Chart(ctx, {
        type: 'line',
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

  private getChartData() {
    return {
      labels: this.data.labels,
      datasets: this.data.datasets.map((x: ChartDataSet) => ({
        label: x.legend,
        data: x.data,
        fill: false,
        borderColor: x.color,
      })),
    };
  }
}
