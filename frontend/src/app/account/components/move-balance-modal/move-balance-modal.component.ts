import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyItem, FinancingSection, MoveBalancePayload } from '../../types/account.types';

export interface MoveBalanceModalData {
  section: FinancingSection;
  allSections: FinancingSection[];
  isSavings: boolean;
  currencies: CurrencyItem[];
  onValidate?: () => boolean;
  result?: MoveBalancePayload;
}

@Component({
  selector: 'app-move-balance-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,
  ],
  templateUrl: './move-balance-modal.component.html',
  styleUrl: './move-balance-modal.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class MoveBalanceModalComponent implements OnInit {
  @Input() data!: MoveBalanceModalData;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01), Validators.max(this.data.section.balance)]],
      destinationType: [null, Validators.required],
      targetSectionId: [null],
      sectionType: ['banking'],
      name: [''],
      currencyId: [null],
      isLocked: [false],
      alwaysAvailable: [false],
      investmentRate: [null],
      investmentStartDate: [null],
      investmentEndDate: [null],
    });

    this.form.get('destinationType')?.valueChanges.subscribe(() => this.updateValidators());
    this.form.get('sectionType')?.valueChanges.subscribe(() => this.updateValidators());
    this.form.get('alwaysAvailable')?.valueChanges.subscribe(() => this.updateValidators());

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (this.form.valid) {
        this.data.result = this.buildResult();
        return true;
      }
      return false;
    };

    const defaultDest = this.data.isSavings && this.hasMainSection
      ? 'account'
      : this.otherSections.length > 0
        ? 'section'
        : 'new';
    this.form.get('destinationType')?.setValue(defaultDest);
  }

  get source(): FinancingSection {
    return this.data.section;
  }

  get hasMainSection(): boolean {
    return this.data.allSections.some((s) => s.name === 'main');
  }

  get otherSections(): FinancingSection[] {
    return this.data.allSections.filter((s) => s.id !== this.data.section.id && s.name !== 'main');
  }

  get destinationType(): string {
    return this.form.get('destinationType')?.value ?? '';
  }

  get sectionType(): string {
    return this.form.get('sectionType')?.value ?? 'banking';
  }

  get isInvestmentSection(): boolean {
    return this.sectionType === 'investment';
  }

  get isAlwaysAvailable(): boolean {
    return !!this.form.get('alwaysAvailable')?.value;
  }

  get projectedEarnings(): number {
    if (!this.isInvestmentSection) return 0;
    const rate = this.form.get('investmentRate')?.value;
    const amount = this.form.get('amount')?.value;
    if (!rate || !amount) return 0;
    if (this.isAlwaysAvailable) {
      return amount * (rate / 100);
    }
    const start = this.form.get('investmentStartDate')?.value;
    const end = this.form.get('investmentEndDate')?.value;
    if (!start || !end) return 0;
    const days = Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return amount * (rate / 100) * (days / 365);
  }

  setAll(): void {
    this.form.get('amount')?.setValue(this.data.section.balance);
  }

  private buildResult(): MoveBalancePayload {
    const raw = this.form.getRawValue();
    const payload: MoveBalancePayload = {
      amount: raw.amount,
      destinationType: raw.destinationType,
    };

    if (raw.destinationType === 'section') {
      payload.targetSectionId = raw.targetSectionId;
    } else if (raw.destinationType === 'new') {
      const isInvestment = raw.sectionType === 'investment';
      const isLocked = raw.isLocked;
      const alwaysAvailable = isInvestment && !!raw.alwaysAvailable;
      let isAvailable: boolean;
      if (isLocked) {
        isAvailable = false;
      } else if (isInvestment && !alwaysAvailable) {
        const now = new Date();
        const start = raw.investmentStartDate ? new Date(raw.investmentStartDate) : null;
        const end = raw.investmentEndDate ? new Date(raw.investmentEndDate) : null;
        isAvailable = !!(start && end && start <= now && end >= now);
      } else {
        isAvailable = true;
      }
      payload.newSection = {
        currencyId: raw.currencyId,
        name: raw.name,
        balance: raw.amount,
        isInvestment,
        isLocked,
        isAvailable,
        investmentRate: isInvestment ? raw.investmentRate : null,
        investmentStartDate: isInvestment && !alwaysAvailable && raw.investmentStartDate
          ? raw.investmentStartDate.toISOString().split('T')[0]
          : null,
        investmentEndDate: isInvestment && !alwaysAvailable && raw.investmentEndDate
          ? raw.investmentEndDate.toISOString().split('T')[0]
          : null,
      };
    }

    return payload;
  }

  private updateValidators(): void {
    const dest = this.destinationType;
    const targetCtrl = this.form.get('targetSectionId');
    const nameCtrl = this.form.get('name');
    const currencyCtrl = this.form.get('currencyId');
    const rateCtrl = this.form.get('investmentRate');
    const startCtrl = this.form.get('investmentStartDate');
    const endCtrl = this.form.get('investmentEndDate');

    [targetCtrl, nameCtrl, currencyCtrl, rateCtrl, startCtrl, endCtrl].forEach((c) => c?.clearValidators());

    if (dest === 'section') {
      targetCtrl?.setValidators(Validators.required);
    } else if (dest === 'new') {
      nameCtrl?.setValidators(Validators.required);
      currencyCtrl?.setValidators(Validators.required);
      if (this.isInvestmentSection) {
        rateCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
        if (this.isAlwaysAvailable) {
          startCtrl?.setValue(null, { emitEvent: false });
          endCtrl?.setValue(null, { emitEvent: false });
        } else {
          startCtrl?.setValidators(Validators.required);
          endCtrl?.setValidators(Validators.required);
        }
      }
    }

    [targetCtrl, nameCtrl, currencyCtrl, rateCtrl, startCtrl, endCtrl].forEach((c) =>
      c?.updateValueAndValidity({ emitEvent: false })
    );
  }
}
