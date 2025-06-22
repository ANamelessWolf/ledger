import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { EMPTY_FREE_MONTHLY_INT, IFreeMontlyInt } from '@moNoInt/types/monthlyNoInterest';

@Component({
  selector: 'app-interest-free-monthly-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './interest-free-monthly-overview.component.html',
  styleUrl: './interest-free-monthly-overview.component.scss'
})
export class InterestFreeMonthlyOverviewComponent {
  @Input() intFreeMo!: IFreeMontlyInt;
}
