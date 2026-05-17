import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MoneyPipe } from '@common/pipes/money.pipe';
import { BudgetItemDetail, BudgetSummary, PERIOD_LABELS, PeriodType, SummaryRequest } from '@budget/types/budgetTypes';
import { CatalogItem } from '@common/types/catalogTypes';
import {
  WeekOption,
  MonthOption,
  buildYearRange,
  getCurrentWeekIndex,
  getMonthsOfYear,
  getWeeksOfMonth,
  toSqlDate,
} from '@budget/utils/budgetDateUtils';

@Component({
  selector: 'app-budget-summary-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MoneyPipe,
  ],
  templateUrl: './budget-summary-card.component.html',
  styleUrl: './budget-summary-card.component.scss',
})
export class BudgetSummaryCardComponent implements OnInit {
  @Input() summaries: BudgetSummary[] = [];
  @Input() allBudgetItems: BudgetItemDetail[] = [];
  @Input() expenseTypes: CatalogItem[] = [];
  @Input() vendors: CatalogItem[] = [];
  @Input() set yearRange(value: { minYear: number; maxYear: number } | null) {
    if (value) {
      this.availableYears = buildYearRange(value.minYear, value.maxYear);
    }
  }

  @Output() summaryRequested = new EventEmitter<SummaryRequest>();
  @Output() detailsRequested = new EventEmitter<{ budgetId: number; start: string; end: string }>();
  @Output() manageItemsRequested = new EventEmitter<number>();

  periodLabels = PERIOD_LABELS;
  periods: PeriodType[] = ['week', 'month', 'year'];
  activePeriod: PeriodType = 'month';
  expandedCards = new Set<number>();

  // Week
  availableWeeks: WeekOption[] = [];
  selectedWeekIndex = 0;

  // Month
  availableMonths: MonthOption[] = [];
  selectedMonthIndex = 0;

  // Year
  availableYears: number[] = [];
  selectedYear = new Date().getFullYear();

  ngOnInit(): void {
    this.initSelections();
    this.emit();
  }

  onPeriodChange(period: PeriodType): void {
    this.activePeriod = period;
    this.emit();
  }

  onWeekChange(): void {
    this.emit();
  }

  onMonthChange(): void {
    this.emit();
  }

  onYearChange(): void {
    // Rebuild weeks/months for the selected year if needed
    if (this.activePeriod === 'week') {
      this.availableWeeks = getWeeksOfMonth(this.selectedYear, this.selectedMonthIndex);
      this.selectedWeekIndex = 0;
    } else if (this.activePeriod === 'month') {
      this.availableMonths = getMonthsOfYear(this.selectedYear);
    }
    this.emit();
  }

  getProgressValue(s: BudgetSummary): number {
    if (s.budgetTotal <= 0) return 0;
    return Math.min((s.spentTotal / s.budgetTotal) * 100, 100);
  }

  getProgressColor(s: BudgetSummary): 'primary' | 'accent' | 'warn' {
    const pct = this.getProgressValue(s);
    if (pct >= 100) return 'warn';
    if (pct >= 80) return 'accent';
    return 'primary';
  }

  private initSelections(): void {
    const today = new Date();
    this.selectedYear = today.getFullYear();

    this.availableMonths = getMonthsOfYear(this.selectedYear);
    this.selectedMonthIndex = today.getMonth();

    this.availableWeeks = getWeeksOfMonth(this.selectedYear, today.getMonth());
    this.selectedWeekIndex = getCurrentWeekIndex(this.availableWeeks);

    if (this.availableYears.length === 0) {
      this.availableYears = [this.selectedYear];
    }
  }

  onManageItemsClick(budgetId: number, event: Event): void {
    event.stopPropagation();
    this.manageItemsRequested.emit(budgetId);
  }

  toggleExpand(budgetId: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedCards.has(budgetId)) {
      this.expandedCards.delete(budgetId);
    } else {
      this.expandedCards.add(budgetId);
    }
  }

  isExpanded(budgetId: number): boolean {
    return this.expandedCards.has(budgetId);
  }

  getExpenseTypeChips(budgetId: number): CatalogItem[] {
    return this.allBudgetItems
      .filter((i) => i.budgetId === budgetId && i.itemType === 1)
      .map((i) => this.expenseTypes.find((et) => et.id === i.itemId))
      .filter((et): et is CatalogItem => !!et);
  }

  getVendorChips(budgetId: number): CatalogItem[] {
    return this.allBudgetItems
      .filter((i) => i.budgetId === budgetId && i.itemType === 2)
      .map((i) => this.vendors.find((v) => v.id === i.itemId))
      .filter((v): v is CatalogItem => !!v);
  }

  hasChips(budgetId: number): boolean {
    return this.allBudgetItems.some((i) => i.budgetId === budgetId);
  }

  get isYearPeriod(): boolean {
    return this.activePeriod === 'year';
  }

  get annualSummaries(): BudgetSummary[] {
    return this.summaries.filter((s) => s.annualBudget === 1);
  }

  get monthlySummariesInYear(): BudgetSummary[] {
    return this.summaries.filter((s) => s.annualBudget === 0);
  }

  onDetailsClick(budgetId: number): void {
    let start: string;
    let end: string;

    if (this.activePeriod === 'week') {
      const week = this.availableWeeks[this.selectedWeekIndex];
      if (!week) return;
      start = toSqlDate(week.start);
      end = toSqlDate(week.end);
    } else if (this.activePeriod === 'month') {
      const month = this.availableMonths[this.selectedMonthIndex];
      if (!month) return;
      start = toSqlDate(month.start);
      end = toSqlDate(month.end);
    } else {
      start = `${this.selectedYear}-01-01`;
      end = `${this.selectedYear}-12-31`;
    }

    this.detailsRequested.emit({ budgetId, start, end });
  }

  private emit(): void {
    let start: string;
    let end: string;

    if (this.activePeriod === 'week') {
      const week = this.availableWeeks[this.selectedWeekIndex];
      if (!week) return;
      start = toSqlDate(week.start);
      end = toSqlDate(week.end);
    } else if (this.activePeriod === 'month') {
      const month = this.availableMonths[this.selectedMonthIndex];
      if (!month) return;
      start = toSqlDate(month.start);
      end = toSqlDate(month.end);
    } else {
      start = `${this.selectedYear}-01-01`;
      end = `${this.selectedYear}-12-31`;
    }

    this.summaryRequested.emit({ period: this.activePeriod, start, end });
  }
}
