import { CommonModule, Location } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { NotificationService } from '@common/services/notification.service';
import { getDaysOfMonth } from '@common/utils/formatUtils';
import { SHORT_MONTH_NAME } from '@config/messages';
import { ExpensesService } from '@expense/services/expenses.service';
import {
  DailyExpense,
  Expense,
  ExpenseSearchOptions,
} from '@expense/types/expensesTypes';
import { mapExpense } from '@expense/utils/expenseUtils';
import { LedgerIconComponent } from '../../../common/components/ledger-icon/ledger-icon.component';
import { getWeekOfMonth } from '@common/utils/dateUtils';

@Component({
  selector: 'app-expense-daily-page',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    CurrencyFormatPipe,
    LedgerIconComponent,
  ],
  templateUrl: './expense-daily-page.component.html',
  styleUrl: './expense-daily-page.component.scss',
  providers: [ExpensesService, NotificationService],
})
export class ExpenseDailyPageComponent implements OnInit {
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  daysInWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  isLoading = true;
  error = false;
  expenses: DailyExpense[] = [];
  dailyExpenses: Expense[] = [];
  daysInMonth: number[] = [];
  dayExpenses: { [key: number]: number } = {};
  selectedDay: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private expenseService: ExpensesService,
    private notifService: NotificationService
  ) {}

  get monthName() {
    return SHORT_MONTH_NAME[this.month - 1];
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.month = +params['month'];
      this.year = +params['year'];
      this.getExpenses();
    });
  }

  private getExpenses() {
    this.expenseService.getDailyExpenses(this.month, this.year).subscribe(
      (response) => {
        this.expenses = response.data;
        const totals = this.calculateExpenses(this.expenses);
        console.log(totals);
        this.initializeCalendar();
      },
      this.errorResponse,
      this.completed
    );
  }

  initializeCalendar(): void {
    const date = new Date(this.year, this.month - 1, 1);
    this.daysInMonth = getDaysOfMonth(date);
    this.dayExpenses = {};
    for (const expense of this.expenses) {
      this.dayExpenses[expense.dayId] = expense.total;
    }
  }

  getFilterOptions(day: number) {
    const date = new Date(this.year, this.month - 1, day);
    const options: ExpenseSearchOptions = {
      pagination: {
        page: 1,
        pageSize: 100,
      },
      sorting: {
        orderBy: 'buyDate',
        orderDirection: 'ASC',
      },
      filter: {
        wallet: undefined,
        expenseTypes: undefined,
        vendors: undefined,
        period: {
          start: date,
          end: date,
        },
        expenseRange: undefined,
        description: undefined,
      },
    };
    return options;
  }

  getExpensesForDay(day: number): void {
    if (this.selectedDay === day) {
      this.selectedDay = null;
      this.dailyExpenses = [];
    } else {
      this.selectedDay = day;
      const options: ExpenseSearchOptions = this.getFilterOptions(day);
      this.expenseService.getExpenses(options).subscribe(
        (response) => {
          const { expenses, totalItems } = mapExpense(response);
          this.dailyExpenses = expenses.map((row: any, index: number) => {
            return {
              ...row,
              index,
            };
          });
          console.log(this.dailyExpenses);
        },
        this.errorResponse,
        this.completed
      );
    }
  }

  isSelected(day: number): boolean {
    return this.selectedDay === day;
  }

  goBack() {
    this.location.back();
  }

  private errorResponse(err: HttpErrorResponse) {
    this.error = true;
    this.notifService.showError(err);
  }

  private completed() {
    this.error = true;
    this.isLoading = false;
  }

  private calculateExpenses(expenses: DailyExpense[]) {
    const weeklyTotals: number[] = [];
    let monthlyTotal = 0;
    let minExpense = Number.MAX_VALUE;
    let maxExpense = Number.MIN_VALUE;
    let totalDays = 0;

    // Group by weeks
    const expensesByWeek = expenses.reduce((acc, expense) => {
      const date = new Date(expense.buyDate);
      // Calculate week number in the month
      const weekOfMonth = getWeekOfMonth(date);
      if (!acc[weekOfMonth]) {
        acc[weekOfMonth] = [];
      }
      acc[weekOfMonth].push(expense);
      return acc;
    }, {} as { [week: number]: DailyExpense[] });

    // Calculate totals per week
    Object.keys(expensesByWeek).forEach((week: any) => {
      const total = expensesByWeek[week].reduce(
        (sum, { total }) => sum + total,
        0
      );
      weeklyTotals.push(total);
      monthlyTotal += total;
      totalDays += expensesByWeek[week].length;

      // Calculate min and max
      expensesByWeek[week].forEach((expense) => {
        if (expense.total < minExpense) minExpense = expense.total;
        if (expense.total > maxExpense) maxExpense = expense.total;
      });
    });

    // Calculate average
    const averageExpense = totalDays > 0 ? monthlyTotal / totalDays : 0;

    return {
      weekly: weeklyTotals,
      monthly: monthlyTotal,
      average: averageExpense,
      min: minExpense,
      max: maxExpense,
    };
  }
}
