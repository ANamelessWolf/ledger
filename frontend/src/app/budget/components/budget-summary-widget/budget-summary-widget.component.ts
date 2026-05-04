import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BudgetSummary } from '@budget/types/budgetTypes';
import { MoneyPipe } from '@common/pipes/money.pipe';

@Component({
  selector: 'app-budget-summary-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MoneyPipe],
  templateUrl: './budget-summary-widget.component.html',
  styleUrl: './budget-summary-widget.component.scss',
})
export class BudgetSummaryWidgetComponent {
  @Input() summaries: BudgetSummary[] = [];

  get totalBudget(): number {
    return this.summaries.reduce((acc, s) => acc + s.budgetTotal, 0);
  }

  get totalSpent(): number {
    return this.summaries.reduce((acc, s) => acc + s.spentTotal, 0);
  }

  get totalAvailable(): number {
    return this.summaries.reduce((acc, s) => acc + s.remaining, 0);
  }

  get spentPercent(): number {
    if (this.totalBudget <= 0) return 0;
    return Math.min((this.totalSpent / this.totalBudget) * 100, 100);
  }

  get isOverBudget(): boolean {
    return this.totalAvailable < 0;
  }
}
