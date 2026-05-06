import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PaginationEvent } from '@config/commonTypes';
import { MoneyPipe } from '@common/pipes/money.pipe';
import { Subscription } from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
    MoneyPipe,
  ],
  templateUrl: './subscription-dashboard.component.html',
  styleUrl: './subscription-dashboard.component.scss',
})
export class SubscriptionDashboardComponent {
  @Input() dataSource: Subscription[] = [];
  @Input() totalItems: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() pageSize: number = 25;
  @Input() activeTotal: number = 0;
  @Input() inactiveTotal: number = 0;
  @Input() defaultCurrencySymbol: string = '';

  selectedRow: Subscription | null = null;

  toggleSelection(row: Subscription): void {
    this.selectedRow = this.selectedRow?.id === row.id ? null : row;
  }

  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() edit = new EventEmitter<Subscription>();
  @Output() delete = new EventEmitter<Subscription>();
  @Output() addPayment = new EventEmitter<Subscription>();
  @Output() viewHistory = new EventEmitter<Subscription>();
  @Output() viewPriceHistory = new EventEmitter<Subscription>();

  displayedColumns: string[] = [
    'name',
    'price',
    'wallet',
    'frequency',
    'chargeDay',
    'lastPaymentDate',
    'active',
    'actions',
  ];

  pageChanged(event: PaginationEvent): void {
    this.pageChange.emit({ pageIndex: event.pageIndex + 1, pageSize: event.pageSize });
  }

  sortChanged(event: Sort): void {
    this.sortChange.emit(event);
  }
}
