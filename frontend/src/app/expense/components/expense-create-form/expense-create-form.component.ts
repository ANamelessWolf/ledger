import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { CurrencyInputDirective } from '@common/directives/currency-input.directive';
import { toRequestFormat } from '@common/utils/formatUtils';
import { CatalogItem } from '@common/types/catalogTypes';
import { ExpenseTypeSelectComponent } from '../expense-type-select/expense-type-select.component';
import {
  AddExpense,
  ExpenseOptions,
  ExpenseTypeItem,
} from '@expense/types/expensesTypes';
import { WalletPickerComponent } from '@wallet/components/wallet-picker/wallet-picker.component';

export interface ExpenseCreateData {
  options: ExpenseOptions;
  isValid: () => boolean;
  getResult: () => AddExpense;
}

@Component({
  selector: 'app-expense-create-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CatalogItemSelectComponent,
    ExpenseTypeSelectComponent,
    WalletPickerComponent,
    CurrencyInputDirective,
  ],
  templateUrl: './expense-create-form.component.html',
  styleUrl: './expense-create-form.component.scss',
})
export class ExpenseCreateFormComponent implements OnInit {
  data!: ExpenseCreateData;

  form!: FormGroup;
  walletControl      = new FormControl<number | null>(null);
  expenseTypeControl = new FormControl<ExpenseTypeItem | null>(null);
  vendorControl      = new FormControl<CatalogItem | null>(null);

  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      total:       [null,       [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(), Validators.required],
      description: ['',        Validators.required],
    });

    this.data.isValid   = () => this.isFormValid();
    this.data.getResult = () => this.buildResult();
  }

  get walletMissing(): boolean { return this.submitted && this.walletControl.value === null; }
  get typeMissing():   boolean { return this.submitted && this.expenseTypeControl.value === null; }
  get vendorMissing(): boolean { return this.submitted && this.vendorControl.value === null; }

  get total()       { return this.form.get('total'); }
  get expenseDate() { return this.form.get('expenseDate'); }
  get description() { return this.form.get('description'); }

  private isFormValid(): boolean {
    this.submitted = true;
    return (
      this.form.valid &&
      this.walletControl.value      !== null &&
      this.expenseTypeControl.value !== null &&
      this.vendorControl.value      !== null
    );
  }

  private buildResult(): AddExpense {
    const expenseDate = new Date(this.form.value.expenseDate);
    return {
      total:         this.form.value.total,
      buyDate:       toRequestFormat(expenseDate),
      description:   this.form.value.description,
      walletId:      this.walletControl.value!,
      expenseTypeId: this.expenseTypeControl.value!.id,
      vendorId:      this.vendorControl.value!.id,
    };
  }
}
