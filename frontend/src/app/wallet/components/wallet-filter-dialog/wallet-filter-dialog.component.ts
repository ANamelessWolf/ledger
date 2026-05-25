import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogItemMultiSelectComponent } from '@common/components/catalog-item-multi-select/catalog-item-multi-select.component';
import { CatalogItem } from '@common/types/catalogTypes';

export interface WalletGroupFilter {
  status: 'any' | 'active' | 'inactive';
  currencies: CatalogItem[];
}

export const DEFAULT_WALLET_GROUP_FILTER: WalletGroupFilter = {
  status: 'any',
  currencies: [],
};

export interface WalletFilterFormData {
  current: WalletGroupFilter;
  availableCurrencies: CatalogItem[];
  isValid: () => boolean;
  getResult: () => WalletGroupFilter;
  reset: () => void;
}

@Component({
  selector: 'app-wallet-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CatalogItemMultiSelectComponent,
  ],
  templateUrl: './wallet-filter-dialog.component.html',
  styleUrl: './wallet-filter-dialog.component.scss',
})
export class WalletFilterDialogComponent implements OnInit {
  data!: WalletFilterFormData;

  form!: FormGroup;
  currencyControl = new FormControl<CatalogItem[]>([]);

  statusOptions = [
    { value: 'any',      label: 'Any' },
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.currencyControl.setValue(this.data.current.currencies);
    this.form = this.fb.group({
      status: [this.data.current.status],
    });

    this.data.isValid = () => true;
    this.data.getResult = () => ({
      status: this.form.value.status,
      currencies: this.currencyControl.value ?? [],
    });
    this.data.reset = () => {
      this.form.patchValue({ status: DEFAULT_WALLET_GROUP_FILTER.status });
      this.currencyControl.setValue([]);
    };
  }
}
