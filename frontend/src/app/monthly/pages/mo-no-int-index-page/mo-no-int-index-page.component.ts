import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { InterestFreeCreditCardPieChartComponent } from '@moNoInt/components/interest-free-credit-card-pie-chart/interest-free-credit-card-pie-chart.component';
import { InterestFreeDetailsComponent } from '@moNoInt/components/interest-free-details/interest-free-details.component';
import { InterestFreeMonthlyOverviewComponent } from '@moNoInt/components/interest-free-monthly-overview/interest-free-monthly-overview.component';
import { InterestFreeSummaryComponent } from '@moNoInt/components/interest-free-summary/interest-free-summary.component';
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
  styleUrl: './mo-no-int-index-page.component.scss'
})
export class MoNoIntIndexPageComponent {
  hasFilter: boolean = true;

  onSearch(event: any) {}

  openFilter() {}

  addWallet() {}
}
