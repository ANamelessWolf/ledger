import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { NotificationService } from '@common/services/notification.service';
import { EMPTY_PAGINATION } from '@config/commonTypes';
import { InterestFreeCreditCardPieChartComponent } from '@moNoInt/components/interest-free-credit-card-pie-chart/interest-free-credit-card-pie-chart.component';
import { InterestFreeDetailsComponent } from '@moNoInt/components/interest-free-details/interest-free-details.component';
import { InterestFreeMonthlyOverviewComponent } from '@moNoInt/components/interest-free-monthly-overview/interest-free-monthly-overview.component';
import { InterestFreeSummaryComponent } from '@moNoInt/components/interest-free-summary/interest-free-summary.component';
import { MoNoIntService } from '@moNoInt/services/mo-no-int.service';
import { EMPTY_MONTHLY_INT_FILTER, MoNoIntFilter, MoNoIntSearchOptions, NoIntMonthlyInstallment } from '@moNoInt/types/monthlyNoInterest';
import { mapNoIntMonthlyInstallments } from '@moNoInt/utils/moNoIntUtils';
@Component({
  selector: 'app-mo-no-int-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    SearchBarComponent,
    InterestFreeSummaryComponent,
    InterestFreeMonthlyOverviewComponent,
    InterestFreeDetailsComponent,
    InterestFreeCreditCardPieChartComponent
  ],
  templateUrl: './mo-no-int-index-page.component.html',
  styleUrl: './mo-no-int-index-page.component.scss',
  providers: [MoNoIntService, NotificationService],
})
export class MoNoIntIndexPageComponent  implements OnInit {
  hasFilter: boolean = true;
  options: MoNoIntSearchOptions = {
    pagination: EMPTY_PAGINATION,
    sorting: undefined,
    filter: EMPTY_MONTHLY_INT_FILTER,
  };
  isLoading = true;
  error = false;
  installments: NoIntMonthlyInstallment[] = [];
  totalItems: number = 0;

  constructor(
    private moNoIntService: MoNoIntService,
    private notifService: NotificationService,
  ) {

  }

  ngOnInit(): void {
    this.getNoIntMonthlyInstallments();
  }

  private getNoIntMonthlyInstallments() {
    this.moNoIntService.getNonIntMonthlyInstallments(this.options).subscribe(
      (response) => {
        const { installments, totalItems } = mapNoIntMonthlyInstallments(response);
        this.installments = installments;
        this.totalItems = totalItems;
        console.log(installments, totalItems);
      },
      this.errorResponse,
      this.completed
    );
  }

  onSearch(event: any) {}

  openFilter() {}

  addWallet() {}

  private errorResponse(err: HttpErrorResponse) {
    this.error = true;
    this.notifService.showError(err);
  }

  private completed() {
    this.error = true;
    this.isLoading = false;
  }
}
