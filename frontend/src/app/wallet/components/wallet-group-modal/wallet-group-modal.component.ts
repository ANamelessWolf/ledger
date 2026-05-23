import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyItem, WalletGroupDetail } from '../../types/wallet.types';
import { CurrencyDualListComponent } from '../currency-dual-list/currency-dual-list.component';

export interface WalletGroupModalData {
  mode: 'add' | 'edit';
  currencies: CurrencyItem[];
  group?: WalletGroupDetail;
  onValidate?: () => boolean;
  result?: { name: string; currencyIds?: number[] };
}

@Component({
  selector: 'app-wallet-group-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CurrencyDualListComponent,
  ],
  templateUrl: './wallet-group-modal.component.html',
  styleUrl: './wallet-group-modal.component.scss',
})
export class WalletGroupModalComponent implements OnInit {
  @Input() data!: WalletGroupModalData;
  @ViewChild(CurrencyDualListComponent) dualList!: CurrencyDualListComponent;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.group?.name ?? '', [Validators.required, Validators.maxLength(40)]],
    });

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (!this.form.valid) return false;
      if (this.data.mode === 'add' && this.dualList.added.length === 0) return false;
      this.data.result = {
        name: this.form.value.name,
        currencyIds: this.data.mode === 'add' ? this.dualList.added.map((c) => c.id) : undefined,
      };
      return true;
    };
  }

  get isAdd(): boolean {
    return this.data.mode === 'add';
  }
}
