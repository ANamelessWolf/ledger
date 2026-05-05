import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { toRequestFormat } from '@common/utils/formatUtils';
import { AddExpense } from '@expense/types/expensesTypes';
import { AddPaymentDialogData, ExpenseSearchResult } from '@subscription/types/subscriptionTypes';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-add-payment',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    CatalogItemSelectComponent,
  ],
  templateUrl: './subscription-add-payment.component.html',
  styleUrl: './subscription-add-payment.component.scss',
})
export class SubscriptionAddPaymentComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  searchResults: ExpenseSearchResult[] = [];
  selectedExpenseIds = new Set<number>();
  isSearching = false;

  expenseForm!: FormGroup;
  walletControl = new FormControl(null, Validators.required);
  expenseTypeControl = new FormControl(null, Validators.required);
  vendorControl = new FormControl(null, Validators.required);

  // Map<expenseId, paymentHistoryId> for already-linked expenses
  private existingPaymentMap = new Map<number, number>();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubscriptionAddPaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPaymentDialogData
  ) {}

  ngOnInit(): void {
    // Build map and pre-select already-linked expenses
    for (const p of this.data.existingPayments) {
      this.existingPaymentMap.set(p.expenseId, p.id);
      this.selectedExpenseIds.add(p.expenseId);
    }

    this.expenseForm = this.fb.group({
      total: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
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

  isLinked(expenseId: number): boolean {
    return this.existingPaymentMap.has(expenseId);
  }

  isSelected(id: number): boolean {
    return this.selectedExpenseIds.has(id);
  }

  get allResultsSelected(): boolean {
    return this.searchResults.length > 0 && this.searchResults.every(r => this.selectedExpenseIds.has(r.id));
  }

  get someResultsSelected(): boolean {
    return this.searchResults.some(r => this.selectedExpenseIds.has(r.id)) && !this.allResultsSelected;
  }

  get hasChanges(): boolean {
    const toAdd = this.getToAdd();
    const toRemove = this.getToRemove();
    return toAdd.length > 0 || toRemove.length > 0;
  }

  selectAll(): void {
    for (const r of this.searchResults) {
      this.selectedExpenseIds.add(r.id);
    }
  }

  unselectAll(): void {
    for (const r of this.searchResults) {
      this.selectedExpenseIds.delete(r.id);
    }
  }

  toggleSelection(id: number): void {
    if (this.selectedExpenseIds.has(id)) {
      this.selectedExpenseIds.delete(id);
    } else {
      this.selectedExpenseIds.add(id);
    }
  }

  confirmExisting(): void {
    const toAdd = this.getToAdd();
    const toRemove = this.getToRemove();

    if (toAdd.length > 0) {
      this.data.onPaymentsAdded(toAdd);
    }
    for (const paymentHistoryId of toRemove) {
      this.data.onPaymentUnlinked(paymentHistoryId);
    }

    this.dialogRef.close(true);
  }

  submitNewExpense(): void {
    if (this.expenseForm.invalid || !this.walletControl.value || !this.expenseTypeControl.value || !this.vendorControl.value) return;
    const v = this.expenseForm.value;
    const body: AddExpense = {
      total: +v.total,
      buyDate: toRequestFormat(new Date(v.expenseDate)),
      description: v.description,
      walletId: (this.walletControl.value as any).id,
      expenseTypeId: (this.expenseTypeControl.value as any).id,
      vendorId: (this.vendorControl.value as any).id,
    };
    this.data.onExpenseCreated(body, (expenseId: number) => {
      this.data.onPaymentsAdded([expenseId]);
      this.dialogRef.close(true);
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
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
      if (!this.selectedExpenseIds.has(expenseId)) {
        result.push(paymentHistoryId);
      }
    }
    return result;
  }
}
