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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { toRequestFormat } from '@common/utils/formatUtils';
import {
  AddExpense,
  EMPTY_NEW_EXPENSE,
  ExpenseOptions,
} from '@expense/types/expensesTypes';

@Component({
  selector: 'app-expense-create-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DialogModule,
    MatButtonModule,
    CatalogItemSelectComponent
  ],
  templateUrl: './expense-create-form.component.html',
  styleUrl: './expense-create-form.component.scss',
})
export class ExpenseCreateFormComponent implements OnInit {
  expensesForm: FormGroup;
  walletControl = new FormControl();
  expenseTypeControl = new FormControl();
  vendorControl = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<ExpenseCreateFormComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string,
      options: ExpenseOptions;
      expenseAdded: (newExpense: AddExpense) => void;
    }
  ) {
    this.expensesForm = this.fb.group({
      total: [
        '',
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      expenseDate: [new Date(), Validators.required],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.expensesForm.valid) {
      const expenseDate = new Date(this.expensesForm.value.expenseDate);
      const body: AddExpense = {
        total: +this.expensesForm.value.total,
        expenseDate: toRequestFormat(expenseDate),
        description: this.expensesForm.value.description,
        walletId: this.walletControl.value.id,
        expenseTypeId: this.expenseTypeControl.value.id,
        vendorId: this.vendorControl.value.id,
      };
      this.data.expenseAdded(body);
      this.dialogRef.close();
    }
  }

  get total(){
    return this.expensesForm.get('total');
  }

  get expenseDate(){
    return this.expensesForm.get('expenseDate');
  }

  get description(){
    return this.expensesForm.get('description');
  }

  close() {
    this.dialogRef.close();
  }
}
