import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CurrencyItem, WalletItem, WalletMemberItem } from '../../types/wallet.types';

export interface WalletMemberModalData {
  mode: 'add' | 'edit';
  currencies: CurrencyItem[];
  allWallets: WalletItem[];
  member?: WalletMemberItem;
  onValidate?: () => boolean;
  result?: { currencyId?: number; forwardWalletId: number | null };
}

@Component({
  selector: 'app-wallet-member-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './wallet-member-modal.component.html',
  styleUrl: './wallet-member-modal.component.scss',
})
export class WalletMemberModalComponent implements OnInit {
  @Input() data!: WalletMemberModalData;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.data.mode === 'add') {
      this.form = this.fb.group({
        currencyId: [null, Validators.required],
        forwardWalletId: [null],
      });
    } else {
      this.form = this.fb.group({
        forwardWalletId: [this.data.member?.forwardWalletId ?? null],
      });
    }

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (!this.form.valid) return false;
      const { currencyId, forwardWalletId } = this.form.value;
      this.data.result = {
        currencyId: this.data.mode === 'add' ? currencyId : undefined,
        forwardWalletId: forwardWalletId ?? null,
      };
      return true;
    };
  }

  get isAdd(): boolean {
    return this.data.mode === 'add';
  }

  get walletLabel(): string {
    return this.data.member
      ? `Forward wallet for "${this.data.member.walletName}"`
      : 'Forward Wallet (optional)';
  }
}
