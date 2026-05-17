import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { CatalogItem } from '@common/types/catalogTypes';
import { toRequestFormat } from '@common/utils/formatUtils';
import {
  MonthlyPaymentPayload,
  MonthlyWizardDialogData,
  MonthlyWizardPayload,
  WizardCreditCard,
  WizardExpenseSearchResult,
  WizardPaymentRow,
  WizardWallet,
} from '@moNoInt/types/monthlyAddWizard.types';
import { WizardStep1Component } from './step1/wizard-step1.component';
import { WizardStep2Component } from './step2/wizard-step2.component';
import { WizardStep3Component } from './step3/wizard-step3.component';
import { WizardStep4Component } from './step4/wizard-step4.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-monthly-add-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatStepperModule,
    WizardStep1Component,
    WizardStep2Component,
    WizardStep3Component,
    WizardStep4Component,
  ],
  templateUrl: './monthly-add-wizard.component.html',
  styleUrl: './monthly-add-wizard.component.scss',
})
export class MonthlyAddWizardComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  // Step 1
  creditCardControl = new FormControl<CatalogItem | null>(null, Validators.required);
  step1Form!: FormGroup;
  monthsOptions = Array.from({ length: 36 }, (_, i) => i + 1);

  // Step 2
  newExpenseForm!: FormGroup;
  cardWallets: WizardWallet[] = [];
  cardWalletItems: CatalogItem[] = [];
  walletControl = new FormControl<CatalogItem | null>(null, Validators.required);
  expenseTypeControl = new FormControl<CatalogItem | null>(null, Validators.required);
  vendorControl = new FormControl<CatalogItem | null>(null, Validators.required);
  searchControl = new FormControl('');
  searchResults: WizardExpenseSearchResult[] = [];
  selectedExisting: WizardExpenseSearchResult | null = null;
  isSearching = false;
  activeTab = 0;

  // Step 3
  paymentRows: WizardPaymentRow[] = [];
  paymentTypeControl = new FormControl<CatalogItem | null>(null, Validators.required);
  paymentVendorControl = new FormControl<CatalogItem | null>(null, Validators.required);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MonthlyAddWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MonthlyWizardDialogData
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({
      months: [null, [Validators.required, Validators.min(1), Validators.max(36)]],
    });

    this.newExpenseForm = this.fb.group({
      total: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      buyDate: [new Date(), Validators.required],
      description: ['', Validators.required],
    });

    this.creditCardControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: CatalogItem | null) => {
        if (!item) return;
        const card = this.data.creditCards.find((c) => c.id === item.id);
        this.walletControl.setValue(null);
        this.cardWallets = [];
        this.cardWalletItems = [];
        this.searchResults = [];
        this.selectedExisting = null;
        if (card) {
          this.data.onLoadWallets(card.walletGroupId, (wallets) => {
            this.cardWallets = wallets;
            this.cardWalletItems = wallets.map((w) => ({
              id: w.id,
              name: `${w.name} (${w.currency})`,
            }));
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
        this.data.onSearchExpenses(this.selectedCard.walletGroupId, term.trim(), (results) => {
          this.searchResults = results;
          this.isSearching = false;
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get selectedCard(): WizardCreditCard | null {
    const item = this.creditCardControl.value;
    return item ? (this.data.creditCards.find((c) => c.id === item.id) ?? null) : null;
  }

  get isStep1Valid(): boolean {
    return this.creditCardControl.valid && this.step1Form.valid;
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
    }
    return this.selectedExisting ? +(this.selectedExisting.total / months).toFixed(2) : 0;
  }

  get expenseDescription(): string {
    if (this.activeTab === 0) return this.newExpenseForm.get('description')?.value ?? '';
    return this.selectedExisting?.description ?? '';
  }

  // ── Step 2 handlers ───────────────────────────────────────────────────────

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  onSelectExisting(expense: WizardExpenseSearchResult): void {
    this.selectedExisting = expense;
  }

  onStep2Next(): void {
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
      buyDate = new Date(exp.buyDate);
      description = exp.description;
      total = exp.total;
      walletId = exp.walletId;
    }

    this.paymentTypeControl.setValue(this.expenseTypeControl.value);
    this.paymentVendorControl.setValue(this.vendorControl.value);

    const paymentTotal = +(total / months).toFixed(2);
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

    this.stepper.next();
  }

  // ── Confirm / Cancel ──────────────────────────────────────────────────────

  confirm(): void {
    const card = this.selectedCard!;
    const months = this.selectedMonths;
    const expTypeId = this.paymentTypeControl.value!.id;
    const vendorId = this.paymentVendorControl.value!.id;

    let mainExpenseId: number | undefined;
    let mainExpense: MonthlyPaymentPayload | undefined;

    if (this.activeTab === 0) {
      mainExpense = {
        walletId: this.walletControl.value!.id,
        expenseTypeId: this.expenseTypeControl.value!.id,
        vendorId: this.vendorControl.value!.id,
        total: +this.newExpenseForm.get('total')!.value,
        buyDate: toRequestFormat(new Date(this.newExpenseForm.get('buyDate')!.value)),
        description: `${this.newExpenseForm.get('description')!.value}\n${months} meses sin intereses`,
      };
    } else {
      mainExpenseId = this.selectedExisting!.id;
    }

    const payload: MonthlyWizardPayload = {
      creditCardId: card.id,
      months,
      mainExpenseId,
      mainExpense,
      payments: this.paymentRows.map((row) => ({
        walletId: row.walletId,
        expenseTypeId: expTypeId,
        vendorId: vendorId,
        total: row.total,
        buyDate: toRequestFormat(row.buyDate),
        description: row.description,
      })),
    };

    this.data.onConfirm(payload);
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
