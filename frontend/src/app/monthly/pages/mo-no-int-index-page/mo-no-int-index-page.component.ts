import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { sliceByMonthRange } from '@common/utils/dateUtils';
import { EMPTY_PAGINATION } from '@config/commonTypes';
import { ChartData, EMPTY_CHART_DATA } from '@expense/types/chartComponent';
import { InterestFreeCreditCardPieChartComponent } from '@moNoInt/components/interest-free-credit-card-pie-chart/interest-free-credit-card-pie-chart.component';
import { InterestFreeDetailsComponent } from '@moNoInt/components/interest-free-details/interest-free-details.component';
import { InterestFreeMonthlyOverviewComponent } from '@moNoInt/components/interest-free-monthly-overview/interest-free-monthly-overview.component';
import { InterestFreeSummaryComponent } from '@moNoInt/components/interest-free-summary/interest-free-summary.component';
import { MoNoIntService } from '@moNoInt/services/mo-no-int.service';
import {
  CardBalance,
  CreditCardInstallmentTotal,
  DEFAULT_MO_NO_INT_FILTER,
  EMPTY_CREDIT_CARD_INST_TOT,
  EMPTY_FREE_MONTHLY_INT,
  EMPTY_MONTHLY_INT_FILTER,
  ICardValue,
  IFreeMontlyInt,
  MoNoIntFilter,
  MoNoIntSearchOptions,
  NoIntMonthlyInstallment,
} from '@moNoInt/types/monthlyNoInterest';
import { mapNoIntMonthlyInstallments } from '@moNoInt/utils/moNoIntUtils';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-mo-no-int-index-page',
  standalone: true,
  imports: [
    CommonModule,
    PageLayoutComponent,
    InterestFreeSummaryComponent,
    InterestFreeMonthlyOverviewComponent,
    InterestFreeDetailsComponent,
    InterestFreeCreditCardPieChartComponent,
  ],
  templateUrl: './mo-no-int-index-page.component.html',
  styleUrl: './mo-no-int-index-page.component.scss',
  providers: [MoNoIntService, NotificationService],
})
export class MoNoIntIndexPageComponent implements OnInit {
  activeFilter: MoNoIntFilter = { ...EMPTY_MONTHLY_INT_FILTER };
  walletGroups: CatalogItem[] = [];

  get options(): MoNoIntSearchOptions {
    return { pagination: EMPTY_PAGINATION, sorting: undefined, filter: this.activeFilter };
  }

  get hasFilter(): boolean {
    const f = this.activeFilter;
    const d = DEFAULT_MO_NO_INT_FILTER;
    return (
      f.status        !== d.status        ||
      f.fromMonth     !== d.fromMonth     ||
      f.fromYear      !== d.fromYear      ||
      f.toMonth       !== d.toMonth       ||
      f.toYear        !== d.toYear        ||
      f.walletGroupId !== d.walletGroupId ||
      f.showPaid      !== d.showPaid
    );
  }

  isLoading  = true;
  error      = false;
  installments: NoIntMonthlyInstallment[]  = [];
  totalItems    = 0;
  totals: CreditCardInstallmentTotal       = EMPTY_CREDIT_CARD_INST_TOT;
  overview: IFreeMontlyInt                 = EMPTY_FREE_MONTHLY_INT;
  cards: ICardValue[]                      = [];
  summaryChartData: ChartData              = EMPTY_CHART_DATA;

  constructor(
    private moNoIntService: MoNoIntService,
    private notifService:   NotificationService,
  ) {}

  ngOnInit(): void {
    this.moNoIntService.getWalletGroups().subscribe({
      next: (res: any) => (this.walletGroups = res.data ?? []),
    });
    this.loadInstallments();
  }

  loadInstallments(): void {
    this.isLoading = true;
    this.moNoIntService.getNonIntMonthlyInstallments(this.options).subscribe({
      next: (response) => {
        const { installments, totalItems, totals } = mapNoIntMonthlyInstallments(response);
        this.installments = installments;
        this.totalItems   = totalItems;
        this.totals       = totals;
        const currentMonthly = this.installments.reduce((sum, i) => {
          if (i.paidMonths >= i.months) return sum;
          const currentPayment = i.payments[i.paidMonths];
          return sum + (currentPayment ? currentPayment.value : 0);
        }, 0);
        this.overview = {
          current: this.totals.totals.balance,
          monthly: currentMonthly,
          total:   this.totals.totals.total,
        };
        this.cards = this.totals.cards.map((c: CardBalance) => ({
          card: c.card, color: c.color, value: c.percent, balance: c.value,
        }));
        const { startIndex, endIndex } = sliceByMonthRange(
          this.totals.summary.labels,
          this.activeFilter.fromMonth, this.activeFilter.fromYear,
          this.activeFilter.toMonth,   this.activeFilter.toYear,
        );
        this.summaryChartData = {
          labels: this.totals.summary.labels.slice(startIndex, endIndex),
          datasets: [
            { data: this.totals.summary.balance.slice(startIndex, endIndex), color: 'green', legend: 'balance' },
            { data: this.totals.summary.payment.slice(startIndex, endIndex), color: 'red',   legend: 'payment' },
          ],
        };
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = true;
        this.isLoading = false;
        this.notifService.showError(err);
      },
    });
  }

  onSearch(_event: any): void {}

  openFilter(): void {
    this.moNoIntService.showFilterDialog(
      this.activeFilter,
      this.walletGroups,
      (filter) => {
        this.activeFilter = filter;
        this.loadInstallments();
      }
    );
  }

  addWallet(): void {
    this.moNoIntService.showAddWizardDialog(() => {
      this.notifService.showNotification('Mensualidad creada correctamente', 'success');
      this.loadInstallments();
    });
  }
}
