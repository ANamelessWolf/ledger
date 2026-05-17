import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { WizardPaymentRow } from '@moNoInt/types/monthlyAddWizard.types';

@Component({
  selector: 'app-wizard-step4',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './wizard-step4.component.html',
  styleUrl: './wizard-step4.component.scss',
})
export class WizardStep4Component {
  @Input() creditCardName = '';
  @Input() selectedMonths = 0;
  @Input() expenseDescription = '';
  @Input() paymentTotal = 0;
  @Input() paymentRows: WizardPaymentRow[] = [];

  @Output() cancel = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
