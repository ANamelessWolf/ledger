import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NoIntMonthlyInstallment } from '@moNoInt/types/monthlyNoInterest';
import { PurchaseTableComponent } from '../purchase-table/purchase-table.component';

@Component({
  selector: 'app-interest-free-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, PurchaseTableComponent],
  templateUrl: './interest-free-details.component.html',
  styleUrl: './interest-free-details.component.scss',
})
export class InterestFreeDetailsComponent {
  @Input() installments: NoIntMonthlyInstallment[] = [];
  @Input() statusFilter: 'active' | 'inactive' | 'all' = 'active';
  @Input() showPaid = false;
  @Output() refreshRequest = new EventEmitter<void>();

  get displayInstallments() {
    let result = this.installments ?? [];
    if (!this.showPaid) {
      result = result.filter((i) => i.paidMonths < i.months);
    }
    return result;
  }
}
