import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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

export interface WalletFilterDialogData {
  current: WalletGroupFilter;
  availableCurrencies: CatalogItem[];
}

@Component({
  selector: 'app-wallet-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    CatalogItemMultiSelectComponent,
  ],
  templateUrl: './wallet-filter-dialog.component.html',
  styleUrl: './wallet-filter-dialog.component.scss',
})
export class WalletFilterDialogComponent implements OnInit {
  form!: FormGroup;
  currencyControl = new FormControl<CatalogItem[]>([]);

  statusOptions = [
    { value: 'any',      label: 'Any' },
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<WalletFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WalletFilterDialogData
  ) {}

  ngOnInit(): void {
    this.currencyControl.setValue(this.data.current.currencies);
    this.form = this.fb.group({
      status: [this.data.current.status],
    });
  }

  apply(): void {
    const filter: WalletGroupFilter = {
      status: this.form.value.status,
      currencies: this.currencyControl.value ?? [],
    };
    this.dialogRef.close(filter);
  }

  clear(): void {
    this.dialogRef.close({ ...DEFAULT_WALLET_GROUP_FILTER });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
