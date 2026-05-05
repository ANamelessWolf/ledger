import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AddSubscription, SubscriptionFormData } from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.scss',
})
export class SubscriptionFormComponent implements OnInit {
  form!: FormGroup;
  chargeDays = Array.from({ length: 28 }, (_, i) => i + 1);

  get isEdit(): boolean {
    return !!this.data.subscription;
  }

  get title(): string {
    return this.isEdit ? 'Edit Subscription' : 'New Subscription';
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubscriptionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubscriptionFormData
  ) {}

  ngOnInit(): void {
    const sub = this.data.subscription;
    this.form = this.fb.group({
      name: [sub?.name ?? '', [Validators.required, Validators.maxLength(40)]],
      price: [sub?.price ?? 0, [Validators.required, Validators.min(0.01)]],
      walletId: [sub?.walletId ?? null, Validators.required],
      currencyId: [sub?.currencyId ?? null, Validators.required],
      paymentFrequencyId: [sub?.paymentFrequencyId ?? null, Validators.required],
      chargeDay: [sub?.chargeDay ?? 1, [Validators.required, Validators.min(1), Validators.max(28)]],
      lastPaymentDate: [sub?.lastPaymentDate ? this.parseDate(sub.lastPaymentDate) : new Date(), Validators.required],
      active: [sub?.active !== undefined ? sub.active === 1 : true],
    });
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload: AddSubscription = {
      name: v.name,
      price: +v.price,
      walletId: +v.walletId,
      currencyId: +v.currencyId,
      paymentFrequencyId: +v.paymentFrequencyId,
      chargeDay: +v.chargeDay,
      lastPaymentDate: this.toSqlDate(v.lastPaymentDate),
      active: v.active ? 1 : 0,
    };
    this.data.onSaved(payload);
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  private parseDate(value: string): Date {
    // If it's already a full ISO string (e.g. "2024-01-15T00:00:00.000Z"), parse directly
    // If it's a plain date string (e.g. "2024-01-15"), append local time to avoid UTC offset shifting the day
    return value.includes('T') ? new Date(value) : new Date(value + 'T00:00:00');
  }

  private toSqlDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
