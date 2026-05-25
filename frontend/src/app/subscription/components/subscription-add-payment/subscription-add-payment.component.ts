import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { WalletPickerComponent } from '@wallet/components/wallet-picker/wallet-picker.component';
import { toRequestFormat } from '@common/utils/formatUtils';
import { AddExpense, ExpenseOptions } from '@expense/types/expensesTypes';
import { ExistingPaymentRef, ExpenseSearchResult } from '@subscription/types/subscriptionTypes';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface SubscriptionAddPaymentFormData {
  subscriptionId: number;
  subscriptionName: string;
  expenseOptions: ExpenseOptions;
  existingPayments: ExistingPaymentRef[];
  onSearchExpenses: (description: string, callback: (results: ExpenseSearchResult[]) => void) => void;
  onPaymentsAdded: (expenseIds: number[]) => void;
  onPaymentUnlinked: (paymentHistoryId: number) => void;
  onExpenseCreated: (expense: AddExpense, onCreated: (expenseId: number) => void) => void;
  close: () => void;
  isValid: () => boolean;
  getResult: () => any;
  reset: () => void;
}

@Component({
  selector: 'app-subscription-add-payment',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    CatalogItemSelectComponent,
    WalletPickerComponent,
  ],
  templateUrl: './subscription-add-payment.component.html',
  styleUrl: './subscription-add-payment.component.scss',
})
export class SubscriptionAddPaymentComponent implements OnInit, OnDestroy {
  data!: SubscriptionAddPaymentFormData;

  searchControl = new FormControl('');
  searchResults: ExpenseSearchResult[] = [];
  selectedExpenseIds = new Set<number>();
  isSearching = false;

  expenseForm!: FormGroup;
  walletControl = new FormControl(null, Validators.required);
  expenseTypeControl = new FormControl(null, Validators.required);
  vendorControl = new FormControl(null, Validators.required);

  private existingPaymentMap = new Map<number, number>();
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.data.isValid   = () => true;
    this.data.getResult = () => null;
    this.data.reset     = () => {};

    for (const p of this.data.existingPayments) {
      this.existingPaymentMap.set(p.expenseId, p.id);
      this.selectedExpenseIds.add(p.expenseId);
    }

    this.expenseForm = this.fb.group({
      total:       ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      expenseDate: [new Date(), Validators.required],
      description: ['', Validators.required],
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term) => {
      if (term && term.trim().length >= 2) {
        this.runSearch(term.trim());
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLinked(expenseId: number): boolean { return this.existingPaymentMap.has(expenseId); }
  isSelected(id: number): boolean      { return this.selectedExpenseIds.has(id); }

  get allResultsSelected(): boolean {
    return this.searchResults.length > 0 && this.searchResults.every(r => this.selectedExpenseIds.has(r.id));
  }

  get someResultsSelected(): boolean {
    return this.searchResults.some(r => this.selectedExpenseIds.has(r.id)) && !this.allResultsSelected;
  }

  get hasChanges(): boolean {
    return this.getToAdd().length > 0 || this.getToRemove().length > 0;
  }

  selectAll(): void   { for (const r of this.searchResults) this.selectedExpenseIds.add(r.id); }
  unselectAll(): void { for (const r of this.searchResults) this.selectedExpenseIds.delete(r.id); }

  toggleSelection(id: number): void {
    if (this.selectedExpenseIds.has(id)) {
      this.selectedExpenseIds.delete(id);
    } else {
      this.selectedExpenseIds.add(id);
    }
  }

  confirmExisting(): void {
    const toAdd    = this.getToAdd();
    const toRemove = this.getToRemove();
    if (toAdd.length > 0) this.data.onPaymentsAdded(toAdd);
    for (const paymentHistoryId of toRemove) this.data.onPaymentUnlinked(paymentHistoryId);
    this.data.close();
  }

  submitNewExpense(): void {
    if (this.expenseForm.invalid || !this.walletControl.value || !this.expenseTypeControl.value || !this.vendorControl.value) return;
    const v = this.expenseForm.value;
    const body: AddExpense = {
      total:         +v.total,
      buyDate:       toRequestFormat(new Date(v.expenseDate)),
      description:   v.description,
      walletId:      this.walletControl.value,
      expenseTypeId: (this.expenseTypeControl.value as any).id,
      vendorId:      (this.vendorControl.value as any).id,
    };
    this.data.onExpenseCreated(body, (expenseId: number) => {
      this.data.onPaymentsAdded([expenseId]);
      this.data.close();
    });
  }

  private runSearch(term: string): void {
    this.isSearching = true;
    this.data.onSearchExpenses(term, (results) => {
      this.searchResults = results;
      this.isSearching = false;
    });
  }

  private getToAdd(): number[] {
    return Array.from(this.selectedExpenseIds).filter(id => !this.existingPaymentMap.has(id));
  }

  private getToRemove(): number[] {
    const result: number[] = [];
    for (const [expenseId, paymentHistoryId] of this.existingPaymentMap) {
      if (!this.selectedExpenseIds.has(expenseId)) result.push(paymentHistoryId);
    }
    return result;
  }
}
