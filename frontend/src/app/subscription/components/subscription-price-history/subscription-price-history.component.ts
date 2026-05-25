import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LineChartComponent } from '@common/components/charts/line-chart/line-chart.component';
import { ChartData, EMPTY_CHART_DATA } from '@expense/types/chartComponent';
import { formatShortMonthYear } from '@common/utils/dateUtils';
import { PriceHistoryItem } from '@subscription/types/subscriptionTypes';

export interface SubscriptionPriceHistoryFormData {
  subscriptionId: number;
  subscriptionName: string;
  currencyConversion: number;
  onLoadPriceHistory: (callback: (items: PriceHistoryItem[]) => void) => void;
  close: () => void;
  isValid: () => boolean;
  getResult: () => any;
  reset: () => void;
}

@Component({
  selector: 'app-subscription-price-history',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    LineChartComponent,
  ],
  templateUrl: './subscription-price-history.component.html',
  styleUrl: './subscription-price-history.component.scss',
})
export class SubscriptionPriceHistoryComponent implements OnInit {
  data!: SubscriptionPriceHistoryFormData;
  loading = true;
  chartData: ChartData = EMPTY_CHART_DATA;

  ngOnInit(): void {
    this.data.isValid   = () => true;
    this.data.getResult = () => null;
    this.data.reset     = () => {};

    this.data.onLoadPriceHistory((items: PriceHistoryItem[]) => {
      this.chartData = this.buildChartData(items);
      this.loading   = false;
    });
  }

  private buildChartData(items: PriceHistoryItem[]): ChartData {
    const factor   = this.data.currencyConversion;
    const compacted = this.compactHistory(items);
    return {
      labels:   compacted.map(i => formatShortMonthYear(i.buyDate)),
      datasets: [{ legend: 'Price', data: compacted.map(i => i.total * factor), color: '#087e8b' }],
    };
  }

  private compactHistory(items: PriceHistoryItem[]): PriceHistoryItem[] {
    if (items.length <= 2) return items;
    const indices = new Set<number>();
    for (let i = 0; i < items.length; i++) {
      if (i === 0 || items[i].total !== items[i - 1].total) indices.add(i);
    }
    indices.add(items.length - 2);
    indices.add(items.length - 1);
    return Array.from(indices).sort((a, b) => a - b).map(i => items[i]);
  }
}
