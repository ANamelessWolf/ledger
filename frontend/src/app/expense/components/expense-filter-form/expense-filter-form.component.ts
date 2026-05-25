import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
  ExpenseTypeItem,
} from '@expense/types/expensesTypes';
import { ExpenseTypeMultiSelectComponent } from '../expense-type-multi-select/expense-type-multi-select.component';

export interface ExpenseFilterData {
  options: ExpenseFilterOptions;
  isValid: () => boolean;
  getResult: () => ExpenseFilter;
  reset: () => void;
}

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
    ReactiveFormsModule,
    CatalogItemMultiSelectComponent,
    ExpenseTypeMultiSelectComponent,
    RangeSliderComponent,
  ],
  templateUrl: './expense-filter-form.component.html',
  styleUrl: './expense-filter-form.component.scss',
})
export class ExpenseFilterFormComponent implements OnInit {
  data!: ExpenseFilterData;

  filterForm!: FormGroup;
  walletControl       = new FormControl<CatalogItem[]>([]);
  expenseTypeControl  = new FormControl<ExpenseTypeItem[]>([]);
  vendorControl       = new FormControl<CatalogItem[]>([]);
  expenseRangeControl = new FormControl<SliderRange | undefined>(undefined);

  @ViewChild('walletMultiSelect')     walletMultiSelect!: CatalogItemMultiSelectComponent;
  @ViewChild('expenseTypeMultiSelect') expenseTypeMultiSelect!: ExpenseTypeMultiSelectComponent;
  @ViewChild('vendorMultiSelect')     vendorMultiSelect!: CatalogItemMultiSelectComponent;
  @ViewChild('expenseRange')          expenseRange!: RangeSliderComponent;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const filter = this.data.options.filter;

    this.filterForm = this.fb.group({
      start: [filter.period?.start ?? null],
      end:   [filter.period?.end   ?? null],
    });

    const wallets = this.data.options.wallets.filter(x => filter.wallet?.includes(x.id));
    this.walletControl.setValue(wallets);

    const exTypes = this.data.options.expenseTypes.filter(x => filter.expenseTypes?.includes(x.id));
    this.expenseTypeControl.setValue(exTypes);

    const vendors = this.data.options.vendors.filter(x => filter.vendors?.includes(x.id));
    this.vendorControl.setValue(vendors);

    this.expenseRangeControl.setValue(filter.expenseRange ?? undefined);

    this.data.isValid   = () => true;
    this.data.getResult = () => this.buildFilter();
    this.data.reset     = () => this.resetForm();
  }

  get visibility() { return this.data.options.visibility; }

  private buildFilter(): ExpenseFilter {
    let period: DateRange | undefined;
    if (this.filterForm.value.start && this.filterForm.value.end) {
      period = {
        start: this.filterForm.value.start,
        end:   this.filterForm.value.end,
      };
    }

    let expenseRange: SliderRange | undefined;
    const range = this.expenseRangeControl.value;
    if (range && range.min >= 0 && range.max > 0) {
      expenseRange = { min: range.min, max: range.max };
    }

    const walletIds  = toIds(this.walletControl.value      ?? []);
    const typeIds    = toIds(this.expenseTypeControl.value ?? []);
    const vendorIds  = toIds(this.vendorControl.value      ?? []);

    return {
      wallet:       walletIds.length  > 0 ? walletIds  : undefined,
      expenseTypes: typeIds.length    > 0 ? typeIds    : undefined,
      vendors:      vendorIds.length  > 0 ? vendorIds  : undefined,
      period,
      expenseRange,
      description: this.data.options.filter.description,
    };
  }

  private resetForm(): void {
    this.filterForm = this.fb.group({ start: [null], end: [null] });
    this.expenseRangeControl.setValue(undefined);
    if (this.visibility.enableWallet)       this.walletMultiSelect.reset();
    if (this.visibility.enableExpenseTypes) this.expenseTypeMultiSelect.reset();
    if (this.visibility.enableVendors)      this.vendorMultiSelect.reset();
    if (this.expenseRange)                  this.expenseRange.reset();
  }
}
