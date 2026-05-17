import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { CatalogItem } from '@common/types/catalogTypes';
import { WizardPaymentRow } from '@moNoInt/types/monthlyAddWizard.types';

@Component({
  selector: 'app-wizard-step3',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CatalogItemSelectComponent,
    CurrencyFormatPipe,
  ],
  templateUrl: './wizard-step3.component.html',
  styleUrl: './wizard-step3.component.scss',
})
export class WizardStep3Component {
  @Input() expenseTypes: CatalogItem[] = [];
  @Input() vendors: CatalogItem[] = [];
  @Input() paymentRows: WizardPaymentRow[] = [];
  @Input() paymentTypeControl!: FormControl<CatalogItem | null>;
  @Input() paymentVendorControl!: FormControl<CatalogItem | null>;
  @Input() paymentTotal = 0;
  @Input() isValid = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  readonly columns = ['index', 'description', 'date', 'total'];
}
