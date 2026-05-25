import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { NotificationService } from '@common/services/notification.service';
import { PaginationEvent } from '@config/commonTypes';
import {
  InstallmentPayment,
  NoIntMonthlyInstallment,
  Payment,
} from '@moNoInt/types/monthlyNoInterest';
import { MoNoIntService } from '@moNoInt/services/mo-no-int.service';

@Component({
  selector: 'app-purchase-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './purchase-table.component.html',
  styleUrl: './purchase-table.component.scss',
  providers: [MoNoIntService, NotificationService],
})
export class PurchaseTableComponent {
  @Input() installments: NoIntMonthlyInstallment[] = [];
  @Input() totalItems = 0;
  @Output() pageChange     = new EventEmitter<PaginationEvent>();
  @Output() sortChange     = new EventEmitter<Sort>();
  @Output() refreshRequest = new EventEmitter<void>();

  displayedColumns = ['creditcard', 'purchase', 'monthly', 'balance', 'buyDate', 'actions'];
  pageSizeOptions  = [5, 10, 25, 100];
  pageSize         = 25;

  constructor(
    private moNoIntService: MoNoIntService,
    private notifService: NotificationService,
  ) {}

  monthsPayment(row: NoIntMonthlyInstallment): string[] {
    const unpaid = row.payments.filter(x => !x.isPaid).length;
    const paid   = row.months - unpaid;
    return [
      ...Array(paid).fill('green'),
      ...Array(unpaid).fill('gray'),
    ];
  }

  monthlyPayment(row: NoIntMonthlyInstallment): number {
    try {
      const next = row.payments.find(x => !x.isPaid);
      return next ? next.value : row.payments[row.payments.length - 1].value;
    } catch { return 0; }
  }

  statusTooltip(row: NoIntMonthlyInstallment): string {
    const unpaid = row.payments.filter(x => !x.isPaid).length;
    return `Months Paid: ${row.months - unpaid} / ${row.months}`;
  }

  getBalance(row: NoIntMonthlyInstallment): number {
    return row.payments
      .filter((p: Payment) => !p.isPaid)
      .reduce((sum: number, p: Payment) => sum + p.value, 0);
  }

  getPaidBalance(row: NoIntMonthlyInstallment): number {
    return row.paidMonths === row.months
      ? row.purchase.value
      : row.purchase.value - this.getBalance(row);
  }

  pageChanged(event: PaginationEvent): void {
    this.pageChange.emit({ pageIndex: event.pageIndex + 1, pageSize: event.pageSize });
  }

  sortChanged(event: Sort): void { this.sortChange.emit(event); }

  editPurchase(_id: number, _installment: NoIntMonthlyInstallment): void {}

  showPayments(id: number, _installment: NoIntMonthlyInstallment): void {
    this.moNoIntService.getPayments(id).subscribe({
      next: (response) => {
        const payments = response.data as InstallmentPayment[];
        this.moNoIntService
          .showPaymentsDialog(
            'Lista de Pagos',
            payments.filter(x => x.paymentId !== null),
            id,
            () => this.refreshRequest.emit()
          )
          .subscribe();
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }
}
