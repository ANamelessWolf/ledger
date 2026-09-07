import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { NotificationService } from '@common/services/notification.service';
import { getDaysOfMonth } from '@common/utils/formatUtils';
import { SHORT_MONTH_NAME } from '@config/messages';
import { ExpensesService } from '@expense/services/expenses.service';
import { DailyExpense, Expense, ExpenseSearchOptions } from '@expense/types/expensesTypes';
import { mapExpense } from '@expense/utils/expenseUtils';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface MonthOption {
  value: string;
  label: string;
  month: number;
  year: number;
}

@Component({
  selector: 'app-expense-daily-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CurrencyFormatPipe,
    LedgerIconComponent,
  ],
  templateUrl: './expense-daily-page.component.html',
  styleUrl: './expense-daily-page.component.scss',
  providers: [ExpensesService, NotificationService],
})
export class ExpenseDailyPageComponent implements OnInit {
  month = new Date().getMonth() + 1;
  year  = new Date().getFullYear();

  daysInWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  isLoading      = true;
  expenses:       DailyExpense[] = [];
  dailyExpenses:  Expense[]      = [];
  daysInMonth:    number[]       = [];
  dayExpenses:    { [day: number]: number } = {};
  selectedDay:    number | null  = null;
  monthlyTotal    = 0;
  selectedPeriod  = '';
  monthOptions:   MonthOption[]  = [];

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private expenseService: ExpensesService,
    private notifService:   NotificationService,
  ) {}

  // ── Getters ───────────────────────────────────────────────

  get monthName(): string { return SHORT_MONTH_NAME[this.month - 1]; }

  get selectedDayTotal(): number {
    return this.selectedDay ? (this.dayExpenses[this.selectedDay] ?? 0) : 0;
  }

  get selectedDayLabel(): string {
    if (!this.selectedDay) return '';
    return `${MONTH_LABELS[this.month - 1]} ${this.selectedDay}, ${this.year}`;
  }

  // ── Lifecycle ─────────────────────────────────────────────

  ngOnInit(): void {
    this.buildMonthOptions();
    this.route.params.subscribe((params) => {
      this.month  = +params['month'];
      this.year   = +params['year'];
      this.selectedPeriod  = `${this.month}-${this.year}`;
      this.selectedDay     = null;
      this.dailyExpenses   = [];
      this.getExpenses();
    });
  }

  private buildMonthOptions(): void {
    const today = new Date();
    const options: MonthOption[] = [];
    for (let i = -24; i <= 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      options.push({ value: `${m}-${y}`, label: `${MONTH_LABELS[m - 1]} ${y}`, month: m, year: y });
    }
    this.monthOptions = options;
  }

  // ── Navigation ────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/expenses']);
  }

  onMonthChange(value: string): void {
    const [month, year] = value.split('-').map(Number);
    this.router.navigate(['/expenses/daily', month, year]);
  }

  // ── Calendar ──────────────────────────────────────────────

  isSelected(day: number): boolean { return this.selectedDay === day; }

  isToday(day: number): boolean {
    const t = new Date();
    return day > 0 && t.getDate() === day &&
           t.getMonth() + 1 === this.month &&
           t.getFullYear() === this.year;
  }

  hasExpense(day: number): boolean { return day > 0 && !!this.dayExpenses[day]; }

  clickDay(day: number): void {
    if (day <= 0) return;
    if (this.selectedDay === day) {
      this.selectedDay   = null;
      this.dailyExpenses = [];
    } else {
      this.getExpensesForDay(day);
    }
  }

  // ── Data ──────────────────────────────────────────────────

  private getExpenses(): void {
    this.expenseService.getDailyExpenses(this.month, this.year).subscribe(
      (response) => {
        this.expenses     = response.data;
        this.monthlyTotal = this.calculateMonthlyTotal(this.expenses);
        this.initializeCalendar();
      },
      (err: HttpErrorResponse) => { this.notifService.showError(err); }
    );
  }

  private initializeCalendar(): void {
    const date       = new Date(this.year, this.month - 1, 1);
    this.daysInMonth = getDaysOfMonth(date);
    this.dayExpenses = {};
    for (const expense of this.expenses) {
      this.dayExpenses[expense.dayId] = expense.total;
    }
  }

  private getExpensesForDay(day: number): void {
    this.selectedDay = day;
    const start = new Date(Date.UTC(this.year, this.month - 1, day, 0, 0, 0, 0));
    const end   = new Date(Date.UTC(this.year, this.month - 1, day, 23, 59, 59, 999));
    const options: ExpenseSearchOptions = {
      pagination: { page: 1, pageSize: 100 },
      sorting:    { orderBy: 'buyDate', orderDirection: 'ASC' },
      filter:     { period: { start, end } },
    };
    this.expenseService.getExpenses(options).subscribe(
      (response) => {
        const { expenses } = mapExpense(response);
        this.dailyExpenses = expenses.map((row, index) => ({ ...row, index }));
      },
      (err: HttpErrorResponse) => { this.notifService.showError(err); }
    );
  }

  private calculateMonthlyTotal(expenses: DailyExpense[]): number {
    return expenses.reduce((sum, e) => sum + e.total, 0);
  }
}
