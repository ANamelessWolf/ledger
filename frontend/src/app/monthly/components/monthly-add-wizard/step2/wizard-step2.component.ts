import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { CatalogItem } from '@common/types/catalogTypes';
import { WizardExpenseSearchResult } from '@moNoInt/types/monthlyAddWizard.types';

@Component({
  selector: 'app-wizard-step2',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CatalogItemSelectComponent,
    CurrencyFormatPipe,
  ],
  templateUrl: './wizard-step2.component.html',
  styleUrl: './wizard-step2.component.scss',
})
export class WizardStep2Component {
  @Input() expenseTypes: CatalogItem[] = [];
  @Input() vendors: CatalogItem[] = [];
  @Input() cardWalletItems: CatalogItem[] = [];
  @Input() newExpenseForm!: FormGroup;
  @Input() walletControl!: FormControl<CatalogItem | null>;
  @Input() expenseTypeControl!: FormControl<CatalogItem | null>;
  @Input() vendorControl!: FormControl<CatalogItem | null>;
  @Input() searchControl!: FormControl<string | null>;
  @Input() searchResults: WizardExpenseSearchResult[] = [];
  @Input() selectedExisting: WizardExpenseSearchResult | null = null;
  @Input() isSearching = false;
  @Input() isValid = false;
  @Input() selectedMonths = 0;
  @Input() descriptionHint = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() tabChange = new EventEmitter<number>();
  @Output() selectExisting = new EventEmitter<WizardExpenseSearchResult>();
}
