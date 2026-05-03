import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BudgetSummary, PERIOD_LABELS, PeriodType, SummaryRequest } from '@budget/types/budgetTypes';
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
    MatCardModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './budget-summary-card.component.html',
  styleUrl: './budget-summary-card.component.scss',
})
export class BudgetSummaryCardComponent implements OnInit {
  @Input() summaries: BudgetSummary[] = [];
  @Input() set yearRange(value: { minYear: number; maxYear: number } | null) {
    if (value) {
      this.availableYears = buildYearRange(value.minYear, value.maxYear);
    }
  }

  @Output() summaryRequested = new EventEmitter<SummaryRequest>();

  periodLabels = PERIOD_LABELS;
  periods: PeriodType[] = ['week', 'month', 'year'];
  activePeriod: PeriodType = 'month';

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
