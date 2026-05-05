import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SubscriptionSummary } from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './subscription-summary.component.html',
  styleUrl: './subscription-summary.component.scss',
})
export class SubscriptionSummaryComponent implements OnInit, OnChanges {
  @Input() summary: SubscriptionSummary | null = null;
  @Output() periodChange = new EventEmitter<{ month: number; year: number }>();

  selectedMonth: number;
  selectedYear: number;

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  years: number[] = [];

  constructor() {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    const currentYear = now.getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.periodChange.emit({ month: this.selectedMonth, year: this.selectedYear });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  onPeriodChange(): void {
    this.periodChange.emit({ month: this.selectedMonth, year: this.selectedYear });
  }
}
