import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { toRequestFormat } from '@common/utils/formatUtils';
import { CatalogItem } from '@common/types/catalogTypes';
import {
  MonthlyPaymentPayload,
  MonthlyWizardDialogData,
  MonthlyWizardPayload,
  WizardCreditCard,
  WizardExpenseSearchResult,
  WizardPaymentRow,
  WizardWallet,
} from '@moNoInt/types/monthlyAddWizard.types';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-monthly-add-wizard',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CatalogItemSelectComponent,
    CurrencyFormatPipe,
  ],
  templateUrl: './monthly-add-wizard.component.html',
  styleUrl: './monthly-add-wizard.component.scss',
})
export class MonthlyAddWizardComponent implements OnInit, OnDestroy {
  // Step forms
  step1Form!: FormGroup;
  newExpenseForm!: FormGroup;

  // Step 1
  selectedCard: WizardCreditCard | null = null;
  monthsOptions = Array.from({ length: 36 }, (_, i) => i + 1);

  // Step 2 — new expense
  cardWallets: WizardWallet[] = [];
  walletControl = new FormControl<WizardWallet | null>(null, Validators.required);
  expenseTypeControl = new FormControl<CatalogItem | null>(null, Validators.required);
  vendorControl = new FormControl<CatalogItem | null>(null, Validators.required);

  // Step 2 — existing expense
  activeTab = 0;
  searchControl = new FormControl('');
  searchResults: WizardExpenseSearchResult[] = [];
  selectedExisting: WizardExpenseSearchResult | null = null;
  isSearching = false;

  // Step 3 — payments
  paymentRows: WizardPaymentRow[] = [];
  paymentTypeControl = new FormControl<CatalogItem | null>(null, Validators.required);
  paymentVendorControl = new FormControl<CatalogItem | null>(null, Validators.required);
  paymentColumns = ['index', 'description', 'date', 'total'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MonthlyAddWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MonthlyWizardDialogData
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({
      creditCard: [null, Validators.required],
      months: [null, [Validators.required, Validators.min(1), Validators.max(36)]],
    });

    this.newExpenseForm = this.fb.group({
      total: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      buyDate: [new Date(), Validators.required],
      description: ['', Validators.required],
    });

    this.step1Form.get('creditCard')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((card: WizardCreditCard | null) => {
        if (card) {
          this.selectedCard = card;
          this.walletControl.setValue(null);
          this.searchResults = [];
          this.selectedExisting = null;
          this.data.onLoadWallets(card.walletGroupId, (wallets) => {
            this.cardWallets = wallets;
          });
        }
      });

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term) => {
      if (term && term.trim().length >= 2 && this.selectedCard) {
        this.isSearching = true;
        this.data.onSearchExpenses(
          this.selectedCard.walletGroupId,
          term.trim(),
          (results) => {
            this.searchResults = results;
            this.isSearching = false;
          }
        );
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Validity helpers ──────────────────────────────────────────────────────

  get isStep1Valid(): boolean {
    return this.step1Form.valid;
  }

  get isStep2Valid(): boolean {
    if (this.activeTab === 0) {
      return (
        this.newExpenseForm.valid &&
        !!this.walletControl.value &&
        !!this.expenseTypeControl.value &&
        !!this.vendorControl.value
      );
    }
    return !!this.selectedExisting;
  }

  get isStep3Valid(): boolean {
    return !!this.paymentTypeControl.value && !!this.paymentVendorControl.value;
  }

  // ── Computed display ─────────────────────────────────────────────────────

  get selectedMonths(): number {
    return this.step1Form.get('months')?.value ?? 0;
  }

  get descriptionHint(): string {
    return `${this.selectedMonths} meses sin intereses`;
  }

  get paymentTotal(): number {
    const months = this.selectedMonths;
    if (months <= 0) return 0;
    if (this.activeTab === 0) {
      const total = +this.newExpenseForm.get('total')?.value;
      return isNaN(total) ? 0 : +(total / months).toFixed(2);
    } else {
      return this.selectedExisting ? +(this.selectedExisting.total / months).toFixed(2) : 0;
    }
  }

  // ── Tab helpers ───────────────────────────────────────────────────────────

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  selectExisting(expense: WizardExpenseSearchResult): void {
    this.selectedExisting = expense;
  }

  // ── Step navigation ───────────────────────────────────────────────────────

  buildPaymentRows(): void {
    const months = this.selectedMonths;
    let buyDate: Date;
    let description: string;
    let total: number;
    let walletId: number;

    if (this.activeTab === 0) {
      buyDate = new Date(this.newExpenseForm.get('buyDate')!.value);
      description = this.newExpenseForm.get('description')!.value as string;
      total = +this.newExpenseForm.get('total')!.value;
      walletId = this.walletControl.value!.id;
    } else {
      const exp = this.selectedExisting!;
      // buyDate from string like "January 5, 2026" — parse via Date constructor
      buyDate = new Date(exp.buyDate);
      description = exp.description;
      total = exp.total;
      walletId = exp.walletId;
    }

    const paymentTotal = +(total / months).toFixed(2);

    // Pre-fill step 3 shared type/vendor from step 2 selection
    this.paymentTypeControl.setValue(this.expenseTypeControl.value);
    this.paymentVendorControl.setValue(this.vendorControl.value);

    this.paymentRows = Array.from({ length: months }, (_, i) => {
      const payDate = new Date(buyDate);
      payDate.setMonth(payDate.getMonth() + i);
      return {
        index: i + 1,
        description: `${description}\nMensualidad ${i + 1}/${months}`,
        buyDate: payDate,
        total: paymentTotal,
        walletId,
      };
    });
  }

  updatePaymentDate(row: WizardPaymentRow, event: any): void {
    if (event.value) {
      row.buyDate = event.value;
    }
  }

  // ── Confirm ───────────────────────────────────────────────────────────────

  confirm(): void {
    const card = this.step1Form.get('creditCard')!.value as WizardCreditCard;
    const months = this.selectedMonths;
    const expTypeId = (this.paymentTypeControl.value as CatalogItem).id;
    const vendorId = (this.paymentVendorControl.value as CatalogItem).id;

    let mainExpenseId: number | undefined;
    let mainExpense: MonthlyPaymentPayload | undefined;

    if (this.activeTab === 0) {
      const desc = `${this.newExpenseForm.get('description')!.value}\n${months} meses sin intereses`;
      mainExpense = {
        walletId: this.walletControl.value!.id,
        expenseTypeId: this.expenseTypeControl.value!.id,
        vendorId: this.vendorControl.value!.id,
        total: +this.newExpenseForm.get('total')!.value,
        buyDate: toRequestFormat(new Date(this.newExpenseForm.get('buyDate')!.value)),
        description: desc,
      };
    } else {
      mainExpenseId = this.selectedExisting!.id;
    }

    const payments: MonthlyPaymentPayload[] = this.paymentRows.map((row) => ({
      walletId: row.walletId,
      expenseTypeId: expTypeId,
      vendorId: vendorId,
      total: row.total,
      buyDate: toRequestFormat(row.buyDate),
      description: row.description,
    }));

    const payload: MonthlyWizardPayload = {
      creditCardId: card.id,
      months,
      mainExpenseId,
      mainExpense,
      payments,
    };

    this.data.onConfirm(payload);
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
