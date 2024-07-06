import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CatalogItemMultiSelectComponent } from '@common/components/catalog-item-multi-select/catalog-item-multi-select.component';
import { RangeSliderComponent } from '@common/components/range-slider/range-slider.component';
import { CatalogItem } from '@common/types/catalogTypes';
import { toIds } from '@common/utils/formatUtils';
import { SliderRange } from '@config/commonTypes';
import {
  DateRange,
  ExpenseFilter,
  ExpenseFilterOptions,
} from '@expense/types/expensesTypes';
import { filter } from 'rxjs';

@Component({
  selector: 'app-expense-filter-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    ReactiveFormsModule,
    DialogModule,
    CatalogItemMultiSelectComponent,
    RangeSliderComponent,
  ],
  templateUrl: './expense-filter-form.component.html',
  styleUrl: './expense-filter-form.component.scss',
})
export class ExpenseFilterFormComponent {
  filterForm: FormGroup;
  walletControl = new FormControl();
  expenseTypeControl = new FormControl();
  vendorControl = new FormControl();
  expenseRangeControl = new FormControl();

  @ViewChild('walletMultiSelect') walletMultiSelect!:CatalogItemMultiSelectComponent;
  @ViewChild('expenseTypeMultiSelect') expenseTypeMultiSelect!:CatalogItemMultiSelectComponent;
  @ViewChild('vendorMultiSelect') vendorMultiSelect!:CatalogItemMultiSelectComponent;
  @ViewChild('expenseRange') expenseRange!:RangeSliderComponent;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExpenseFilterFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      options: ExpenseFilterOptions;
      filterSelected: (filter: ExpenseFilter) => void;
    }
  ) {
    this.filterForm = this.fb.group({
      start: [data.options.filter.period?.start],
      end: [data.options.filter.period?.end],
    });

    const filter = data.options.filter;
    const wallet: CatalogItem[] = data.options.wallets.filter((x) =>
      filter.wallet?.includes(x.id)
    );
    this.walletControl.setValue(wallet);
    const exTypes: CatalogItem[] = data.options.expenseTypes.filter((x) =>
      filter.expenseTypes?.includes(x.id)
    );
    this.expenseTypeControl.setValue(exTypes);
    const vendors: CatalogItem[] = data.options.vendors.filter((x) =>
      filter.vendors?.includes(x.id)
    );
    this.vendorControl.setValue(vendors);

    if (filter.expenseRange) {
      this.expenseRangeControl.setValue(filter.expenseRange);
    } else {
      this.expenseRangeControl.setValue(undefined);
    }
  }

  onApply() {
    let period: DateRange | undefined = undefined;
    if (this.filterForm.value.start && this.filterForm.value.end) {
      period = {
        start: this.filterForm.value.start,
        end: this.filterForm.value.end,
      };
    }
    let exRange: SliderRange | undefined = undefined;
    if (this.expenseRangeControl.value) {
      const range = this.expenseRangeControl.value as SliderRange;
      if (range.min >= 0 && range.max > 0) {
        exRange = {
          min: range.min,
          max: range.max,
        };
      }
    }

    const walletIds = toIds(this.walletControl.value);
    const exTypesIds = toIds(this.expenseTypeControl.value);
    const vendorIds = toIds(this.vendorControl.value);

    const filter: ExpenseFilter = {
      wallet: walletIds.length > 0 ? walletIds : undefined,
      expenseTypes: exTypesIds.length > 0 ? exTypesIds : undefined,
      vendors: vendorIds.length > 0 ? vendorIds : undefined,
      period: period,
      expenseRange: exRange,
      description: this.data.options.filter.description,
    };
    this.data.filterSelected(filter);
    this.dialogRef.close();
  }

  onReset(){
    this.walletMultiSelect.reset();
    this.expenseTypeMultiSelect.reset();
    this.vendorMultiSelect.reset();
    this.expenseRange.reset();
    this.filterForm = this.fb.group({
      start: [],
      end: [],
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
