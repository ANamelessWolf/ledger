import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { toRequestFormat } from '@common/utils/formatUtils';
import {
  ExpenseOptions,
  ExpenseRequest,
  UpdateExpense,
} from '@expense/types/expensesTypes';
import { CatalogItem } from '@common/types/catalogTypes';

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
    DialogModule,
    MatButtonModule,
    CatalogItemSelectComponent,
  ],
  templateUrl: './expense-edit-form.component.html',
  styleUrl: './expense-edit-form.component.scss',
})
export class ExpenseEditFormComponent implements OnInit {
  expensesForm: FormGroup;
  walletControl = new FormControl();
  expenseTypeControl = new FormControl();
  vendorControl = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<ExpenseEditFormComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      expense: UpdateExpense;
      options: ExpenseOptions;
      expenseUpdated: (request: ExpenseRequest) => void;
    }
  ) {
    this.expensesForm = this.fb.group({
      total: [
        this.data.expense.total,
        [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)],
      ],
      expenseDate: [new Date(this.data.expense.buyDate), Validators.required],
      description: [this.data.expense.description, [Validators.required]],
    });
    const wallets: CatalogItem[] = data.options.wallets.filter(
      (x) => x.id === data.expense.walletId
    );
    if (wallets.length > 0) {
      this.walletControl.setValue(wallets[0]);
    }
    const exTypes: CatalogItem[] = data.options.expenseTypes.filter(
      (x) => x.id === data.expense.expenseTypeId
    );
    if (exTypes.length > 0) {
      this.expenseTypeControl.setValue(exTypes[0]);
    }
    const vendors: CatalogItem[] = data.options.vendors.filter(
      (x) => x.id === data.expense.vendorId
    );
    if (vendors.length > 0) {
      this.vendorControl.setValue(vendors[0]);
    }
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.expensesForm.valid) {
      const expenseDate = new Date(this.expensesForm.value.expenseDate);
      const id = this.data.expense.id;
      const body: UpdateExpense = {
        id: this.data.expense.id,
        total: +this.expensesForm.value.total,
        buyDate: toRequestFormat(expenseDate),
        description: this.expensesForm.value.description,
        walletId: this.walletControl.value.id,
        expenseTypeId: this.expenseTypeControl.value.id,
        vendorId: this.vendorControl.value.id,
      };

      this.data.expenseUpdated({ id, body });
      this.dialogRef.close();
    }
  }

  get total() {
    return this.expensesForm.get('total');
  }

  get expenseDate() {
    return this.expensesForm.get('expenseDate');
  }

  get description() {
    return this.expensesForm.get('description');
  }

  close() {
    this.dialogRef.close();
  }
}
