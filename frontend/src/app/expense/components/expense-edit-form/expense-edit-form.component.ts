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
  ExpenseOptions,
  ExpenseRequest,
  ExpenseTypeItem,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { WalletPickerComponent } from '@wallet/components/wallet-picker/wallet-picker.component';
import { WalletService } from '@wallet/services/wallet.service';
import { WalletItem } from '@wallet/types/wallet.types';

export interface ExpenseEditData {
  expense: UpdateExpense;
  options: ExpenseOptions;
  isValid: () => boolean;
  getResult: () => ExpenseRequest;
}

@Component({
  selector: 'app-expense-edit-form',
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
  templateUrl: './expense-edit-form.component.html',
  styleUrl: './expense-edit-form.component.scss',
})
export class ExpenseEditFormComponent implements OnInit {
  data!: ExpenseEditData;

  form!: FormGroup;
  walletControl = new FormControl<number | null>(null);
  expenseTypeControl = new FormControl<ExpenseTypeItem | null>(null);
  vendorControl = new FormControl<CatalogItem | null>(null);

  initialWalletGroupId: number | null = null;
  initialWalletCurrencyId: number | null = null;
  walletPickerReady = false;
  submitted = false;

  constructor(private fb: FormBuilder, private walletService: WalletService) {}

  ngOnInit(): void {
    const exp = this.data.expense;

    this.form = this.fb.group({
      total:       [exp.total,                [Validators.required, Validators.min(0.01)]],
      expenseDate: [new Date(exp.buyDate),    Validators.required],
      description: [exp.description,         Validators.required],
    });

    const expType = this.data.options.expenseTypes.find(x => x.id === exp.expenseTypeId);
    if (expType) this.expenseTypeControl.setValue(expType);

    const vendor = this.data.options.vendors.find(x => x.id === exp.vendorId);
    if (vendor) this.vendorControl.setValue(vendor);

    this.walletService.getAllWallets().subscribe({
      next: (res) => {
        const allWallets: WalletItem[] = res.data ?? [];
        const wallet = allWallets.find(w => w.id === exp.walletId);
        if (wallet) {
          this.initialWalletGroupId   = wallet.walletGroupId;
          this.initialWalletCurrencyId = wallet.currencyId;
        }
        this.walletPickerReady = true;
      },
    });

    this.data.isValid   = () => this.isFormValid();
    this.data.getResult = () => this.buildResult();
  }

  get walletMissing(): boolean {
    return this.submitted && this.walletControl.value === null;
  }
  get typeMissing(): boolean {
    return this.submitted && this.expenseTypeControl.value === null;
  }
  get vendorMissing(): boolean {
    return this.submitted && this.vendorControl.value === null;
  }

  get total()       { return this.form.get('total'); }
  get expenseDate() { return this.form.get('expenseDate'); }
  get description() { return this.form.get('description'); }

  private isFormValid(): boolean {
    this.submitted = true;
    return (
      this.form.valid &&
      this.walletControl.value   !== null &&
      this.expenseTypeControl.value !== null &&
      this.vendorControl.value   !== null
    );
  }

  private buildResult(): ExpenseRequest {
    const expenseDate = new Date(this.form.value.expenseDate);
    const body: UpdateExpense = {
      id:            this.data.expense.id,
      total:         this.form.value.total,
      buyDate:       toRequestFormat(expenseDate),
      description:   this.form.value.description,
      walletId:      this.walletControl.value!,
      expenseTypeId: this.expenseTypeControl.value!.id,
      vendorId:      this.vendorControl.value!.id,
    };
    return { id: this.data.expense.id, body };
  }
}
