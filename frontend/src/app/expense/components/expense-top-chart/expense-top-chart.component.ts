import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { Expense } from '@expense/types/expensesTypes';
import { WalletItem } from '@wallet/types/wallet.types';

export type ChartGroupBy = 'expenseType' | 'vendor' | 'wallet';

@Component({
  selector: 'app-expense-top-chart',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './expense-top-chart.component.html',
  styleUrl: './expense-top-chart.component.scss',
})
export class ExpenseTopChartComponent implements OnChanges {
  @Input() expenses: Expense[] = [];
  @Input() groupBy: ChartGroupBy = 'expenseType';
  @Input() title = '';
  @Input() walletItems: WalletItem[] = [];
  @Input() walletLinks: Map<string, string> = new Map();

  constructor(private router: Router) {};

  top10: [string, number][] = [];

  get isEmpty(): boolean  { return this.top10.length === 0; }
  get maxAmount(): number { return this.top10[0]?.[1] ?? 1; }

  ngOnChanges(): void {
    this.top10 = this.computeTop10();
  }

  barPct(amount: number): number {
    return Math.round((amount / this.maxAmount) * 100);
  }

  getLink(name: string): string | null {
    return this.walletLinks.get(name) ?? null;
  }

  navigate(name: string): void {
    const route = this.getLink(name);
    if (route) this.router.navigateByUrl(route);
  }

  private computeTop10(): [string, number][] {
    const map = new Map<string, number>();

    const walletGroupMap = this.buildWalletGroupMap();

    for (const e of this.expenses) {
      if (e.value <= 0) continue;
      const key = this.groupBy === 'wallet'
        ? (walletGroupMap.get(e.walletId) ?? e.wallet)
        : String(e[this.groupBy as keyof Expense] ?? '—');
      map.set(key, (map.get(key) ?? 0) + e.value);
    }

    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  private buildWalletGroupMap(): Map<number, string> {
    const map = new Map<number, string>();
    for (const w of this.walletItems) {
      map.set(w.id, w.walletGroupName ?? w.name);
    }
    return map;
  }
}
