import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogItem } from '@common/types/catalogTypes';
import { AddSubscription, UpdateSubscription } from '@subscription/types/subscriptionTypes';
import { WalletPickerComponent } from '@wallet/components/wallet-picker/wallet-picker.component';
import { WalletItem } from '@wallet/types/wallet.types';

export interface SubscriptionFormDialogData {
  subscription?: UpdateSubscription;
  walletGroups: CatalogItem[];
  currencies: CatalogItem[];
  paymentFrequencies: CatalogItem[];
  onSaved: (data: AddSubscription) => void;
  isValid: () => boolean;
  getResult: () => AddSubscription | null;
  reset: () => void;
}

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    WalletPickerComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.scss',
})
export class SubscriptionFormComponent implements OnInit {
  data!: SubscriptionFormDialogData;
  form!: FormGroup;
  walletControl = new FormControl();
  chargeDays = Array.from({ length: 28 }, (_, i) => i + 1);

  get isEdit(): boolean { return !!this.data.subscription; }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const sub = this.data.subscription;
    this.form = this.fb.group({
      name:               [sub?.name ?? '',             [Validators.required, Validators.maxLength(40)]],
      price:              [sub?.price ?? 0,             [Validators.required, Validators.min(0.01)]],
      walletGroupId:      [sub?.walletGroupId ?? null,  Validators.required],
      currencyId:         [sub?.currencyId ?? null,     Validators.required],
      paymentFrequencyId: [sub?.paymentFrequencyId ?? null, Validators.required],
      chargeDay:          [sub?.chargeDay ?? 1,         [Validators.required, Validators.min(1), Validators.max(28)]],
      lastPaymentDate:    [sub?.lastPaymentDate ? this.parseDate(sub.lastPaymentDate) : new Date(), Validators.required],
      active:             [sub?.active !== undefined ? sub.active === 1 : true],
    });

    this.data.isValid   = () => this.form.valid;
    this.data.getResult = () => this.buildPayload();
    this.data.reset     = () => this.form.reset();
  }

  onWalletChanged(wallet: WalletItem): void {
    this.form.patchValue({ walletGroupId: wallet.walletGroupId, currencyId: wallet.currencyId });
  }

  private buildPayload(): AddSubscription | null {
    if (this.form.invalid) return null;
    const v = this.form.value;
    return {
      name:               v.name,
      price:              +v.price,
      walletGroupId:      +v.walletGroupId,
      currencyId:         +v.currencyId,
      paymentFrequencyId: +v.paymentFrequencyId,
      chargeDay:          +v.chargeDay,
      lastPaymentDate:    this.toSqlDate(v.lastPaymentDate),
      active:             v.active ? 1 : 0,
    };
  }

  private parseDate(value: string): Date {
    return value.includes('T') ? new Date(value) : new Date(value + 'T00:00:00');
  }

  private toSqlDate(d: Date): string {
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
