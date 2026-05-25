import { Component, Input } from '@angular/core';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { IFreeMontlyInt } from '@moNoInt/types/monthlyNoInterest';

@Component({
  selector: 'app-interest-free-monthly-overview',
  standalone: true,
  imports: [CurrencyFormatPipe],
  templateUrl: './interest-free-monthly-overview.component.html',
  styleUrl: './interest-free-monthly-overview.component.scss',
})
export class InterestFreeMonthlyOverviewComponent {
  @Input() intFreeMo!: IFreeMontlyInt;
}
