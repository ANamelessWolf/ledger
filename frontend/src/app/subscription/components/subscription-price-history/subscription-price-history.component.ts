import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LineChartComponent } from '@common/components/charts/line-chart/line-chart.component';
import { ChartData, EMPTY_CHART_DATA } from '@expense/types/chartComponent';
import { formatShortMonthYear } from '@common/utils/dateUtils';
import { PriceHistoryDialogData, PriceHistoryItem } from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-price-history',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LineChartComponent,
  ],
  templateUrl: './subscription-price-history.component.html',
  styleUrl: './subscription-price-history.component.scss',
})
export class SubscriptionPriceHistoryComponent implements OnInit {
  loading = true;
  chartData: ChartData = EMPTY_CHART_DATA;

  constructor(
    private dialogRef: MatDialogRef<SubscriptionPriceHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PriceHistoryDialogData
  ) {}

  ngOnInit(): void {
    this.data.onLoadPriceHistory((items: PriceHistoryItem[]) => {
      this.chartData = this.buildChartData(items);
      this.loading = false;
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private buildChartData(items: PriceHistoryItem[]): ChartData {
    const factor = this.data.currencyConversion;
    const compacted = this.compactHistory(items);
    return {
      labels: compacted.map(i => formatShortMonthYear(i.buyDate)),
      datasets: [{
        legend: 'Price',
        data: compacted.map(i => i.total * factor),
        color: '#1976d2',
      }],
    };
  }

  private compactHistory(items: PriceHistoryItem[]): PriceHistoryItem[] {
    if (items.length <= 2) return items;

    const indices = new Set<number>();

    // First item of each consecutive run with a different price
    for (let i = 0; i < items.length; i++) {
      if (i === 0 || items[i].total !== items[i - 1].total) {
        indices.add(i);
      }
    }

    // Always keep the last 2 entries to show the current trend
    indices.add(items.length - 2);
    indices.add(items.length - 1);

    return Array.from(indices)
      .sort((a, b) => a - b)
      .map(i => items[i]);
  }
}
