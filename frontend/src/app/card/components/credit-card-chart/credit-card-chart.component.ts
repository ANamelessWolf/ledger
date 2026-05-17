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
  @Input() size: string = '220px';
  @Input() masked = false;
  private chart!: any;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary'] || changes['masked']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.data = this.getChartData();
      this.chart.options.plugins.tooltip.enabled = !this.masked;
      this.chart.update();
    }
  }

  get usedPct(): number {
    const used = toNumber(this.summary?.usedCredit ?? 0);
    const limit = toNumber(this.summary?.credit ?? 0);
    if (limit === 0) return 0;
    if (used < 0) return 0;
    return round((used / limit) * 100);
  }

  private cssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private usageColor(pct: number): string {
    if (pct < 40) return this.cssVar('--color-green-fill');
    if (pct < 75) return this.cssVar('--color-yellow-fill');
    return this.cssVar('--color-red-fill');
  }

  private createChart(): void {
    const ctx = (
      document.getElementById('creditCardChart') as HTMLCanvasElement
    ).getContext('2d')!;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: this.getChartData(),
      options: {
        cutout: '78%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw}%`,
            },
          },
        },
      },
    });
  }

  private getChartData() {
    const usedCredit = toNumber(this.summary?.usedCredit ?? 0);
    const limitCredit = toNumber(this.summary?.credit ?? 0);
    let usedPct = round((usedCredit / limitCredit) * 100);
    let remainingPct = round(100 - usedPct);

    let usedColor: string;

    if (usedCredit < 0) {
      remainingPct = round(((limitCredit + usedCredit * -1) / limitCredit) * 100);
      usedPct = 0;
      usedColor = this.cssVar('--color-text-subtle');
    } else {
      usedColor = this.usageColor(usedPct);
    }

    return {
      labels: ['Used', 'Available'],
      datasets: [
        {
          data: [usedPct, remainingPct],
          backgroundColor: [usedColor, 'rgba(0,0,0,0.05)'],
          borderColor: [usedColor, 'rgba(0,0,0,0.06)'],
          borderWidth: 1,
        },
      ],
    };
  }
}
