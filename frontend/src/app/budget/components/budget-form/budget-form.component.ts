import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AddBudget, BudgetFormData } from '@budget/types/budgetTypes';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './budget-form.component.html',
  styleUrl: './budget-form.component.scss',
})
export class BudgetFormComponent implements OnInit {
  form!: FormGroup;

  get isEdit(): boolean {
    return !!this.data.budget;
  }

  get title(): string {
    return this.isEdit ? 'Edit Budget' : 'New Budget';
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BudgetFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BudgetFormData
  ) {}

  ngOnInit(): void {
    const budget = this.data.budget;
    this.form = this.fb.group({
      description: [budget?.description ?? '', [Validators.required, Validators.maxLength(100)]],
      icon: [budget?.icon ?? 'account_balance_wallet'],
      total: [budget?.total ?? 0, [Validators.required, Validators.min(0.01)]],
      currencyId: [budget?.currencyId ?? null, Validators.required],
      startDate: [budget?.startDate ? new Date(budget.startDate + 'T00:00:00') : null],
      endDate: [budget?.endDate ? new Date(budget.endDate + 'T00:00:00') : null],
      annualBudget: [!!(budget?.annualBudget)],
    });
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value;
    const payload: AddBudget = {
      ownerId: 1,
      description: value.description,
      icon: value.icon || 'account_balance_wallet',
      total: +value.total,
      currencyId: +value.currencyId,
      startDate: value.startDate ? this.toSqlDate(value.startDate) : null,
      endDate: value.endDate ? this.toSqlDate(value.endDate) : null,
      annualBudget: value.annualBudget ? 1 : 0,
    };
    this.data.onSaved(payload);
    this.dialogRef.close();
  }

  private toSqlDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cancel() {
    this.dialogRef.close();
  }
}
