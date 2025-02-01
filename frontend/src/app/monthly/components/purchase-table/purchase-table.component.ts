import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { PaginationEvent } from '@config/commonTypes';
import { MatButtonModule } from '@angular/material/button';
import { ExpensesService } from '@expense/services/expenses.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  InstallmentPayment,
  NoIntMonthlyInstallment,
  Payment,
} from '@moNoInt/types/monthlyNoInterest';
import { MoNoIntService } from '@moNoInt/services/mo-no-int.service';
import { NotificationService } from '@common/services/notification.service';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { toCurrency, toRangeCurrency } from '@common/utils/formatUtils';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-purchase-table',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    LedgerIconComponent,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatGridListModule,
    MatTooltipModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './purchase-table.component.html',
  styleUrl: './purchase-table.component.scss',
  providers: [MoNoIntService, NotificationService],
})
export class PurchaseTableComponent {
  @Input() installments: NoIntMonthlyInstallment[] = [];
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  displayedColumns: string[] = [
    'id',
    'creditcard',
    'purchase',
    'monthly',
    'balance',
    'buyDate',
    'actions',
  ];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 25;
  isLoading = true;
  error = false;

  public constructor(
    private moNoIntService: MoNoIntService,
    private notifService: NotificationService
  ) {}

  monthsPayment(row: NoIntMonthlyInstallment) {
    const mP = [];
    for (let index = 1; index <= row.months; index++) {
      if (index <= row.paidMonths) {
        mP.push('green');
      } else {
        mP.push('gray');
      }
    }
    return mP;
  }

  monthlyPayment(row: NoIntMonthlyInstallment) {
    const payments = row.payments.filter((x) => x.isPaid === false);
    if (payments.length > 0) {
      return payments[0].value;
    } else {
      return row.payments[payments.length - 1].value;
    }
    // return row.purchase.value / row.months;
  }

  statusTooltip(row: NoIntMonthlyInstallment) {
    return `Months Paid: ${row.paidMonths} / ${row.months}`;
  }

  getBalance(row: NoIntMonthlyInstallment) {
    if (row.paidMonths === row.months) {
      return 0;
    }
    const sum = row.payments
      .filter((payment: Payment) => payment.isPaid)
      .reduce(
        (partialSum: number, payment: Payment) => partialSum + payment.value,
        0
      );
    return row.purchase.value - sum;
  }

  getPaidBalance(row: NoIntMonthlyInstallment) {
    if (row.paidMonths === row.months) {
      return row.purchase.value;
    }
    return row.purchase.value - this.getBalance(row);
  }

  pageChanged(event: PaginationEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex, pageSize });
  }

  sortChanged(event: Sort) {
    this.sortChange.emit(event);
  }

  editPurchase(id: number, installment: NoIntMonthlyInstallment) {}

  showPayments(id: number, installment: NoIntMonthlyInstallment) {
    this.moNoIntService.getPayments(id).subscribe(
      (response) => {
        const payments = response.data as InstallmentPayment[];
        console.log(payments);
        this.moNoIntService
          .showPaymentsDialog(
            'Lista de Pagos',
            payments.filter((x) => x.paymentId !== null),
            id,
            this.refresh.bind(this)
          )
          .subscribe();
      },
      this.errorResponse,
      this.completed
    );
  }

  private getPayments() {}

  private errorResponse(err: HttpErrorResponse) {
    this.error = true;
    this.notifService.showError(err);
  }

  private completed() {
    this.error = true;
    this.isLoading = false;
  }

  refresh() {
    console.log('refreshing');
  }
}
