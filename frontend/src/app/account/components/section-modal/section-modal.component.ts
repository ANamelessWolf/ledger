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
import { CurrencyItem, FinancingSection } from '../../types/account.types';

export interface SectionModalData {
  currencies: CurrencyItem[];
  section?: FinancingSection;
  onValidate?: () => boolean;
  result?: any;
}

@Component({
  selector: 'app-section-modal',
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
  ],
  templateUrl: './section-modal.component.html',
  styleUrl: './section-modal.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class SectionModalComponent implements OnInit {
  @Input() data!: SectionModalData;

  form!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.data) {
      this.data.onValidate = () => {
        this.form.markAllAsTouched();
        if (this.form.valid) {
          this.data.result = this.getResult();
          return true;
        }
        return false;
      };
    }
    this.isEditing = !!this.data?.section;
    const s = this.data?.section;

    const alwaysAvailable = s?.isInvestment ? (!s.investmentStartDate && !s.investmentEndDate) : false;

    this.form = this.fb.group({
      sectionType: [{ value: s ? (s.isInvestment ? 'investment' : 'banking') : 'banking', disabled: this.isEditing }, Validators.required],
      name: [s?.name ?? '', Validators.required],
      balance: [s?.balance ?? 0, [Validators.required, Validators.min(0)]],
      currencyId: [s?.currencyId ?? null, Validators.required],
      isLocked: [s ? !!s.isLocked : false],
      alwaysAvailable: [alwaysAvailable],
      investmentRate: [s?.investmentRate ?? null],
      investmentStartDate: [s?.investmentStartDate ? new Date(s.investmentStartDate) : null],
      investmentEndDate: [s?.investmentEndDate ? new Date(s.investmentEndDate) : null],
    });

    this.form.get('sectionType')?.valueChanges.subscribe(() => this.updateValidators());
    this.form.get('alwaysAvailable')?.valueChanges.subscribe(() => this.updateValidators());
    this.form.get('isLocked')?.valueChanges.subscribe(() => this.updateIsAvailable());
    this.form.get('investmentStartDate')?.valueChanges.subscribe(() => this.updateIsAvailable());
    this.form.get('investmentEndDate')?.valueChanges.subscribe(() => this.updateIsAvailable());
    this.updateValidators();
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

  get isLocked(): boolean {
    return !!this.form.get('isLocked')?.value;
  }

  get projectedEarnings(): number {
    if (!this.isInvestmentSection) return 0;
    const rate = this.form.get('investmentRate')?.value;
    const balance = this.form.get('balance')?.value;
    if (!rate || !balance) return 0;
    if (this.isAlwaysAvailable) {
      return balance * (rate / 100);
    }
    const start = this.form.get('investmentStartDate')?.value;
    const end = this.form.get('investmentEndDate')?.value;
    if (!start || !end) return 0;
    const days = Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return balance * (rate / 100) * (days / 365);
  }

  getResult(): any {
    const raw = this.form.getRawValue();
    const isInvestment = raw.sectionType === 'investment';
    const isLocked = raw.isLocked;
    let isAvailable: boolean;

    if (isLocked) {
      isAvailable = false;
    } else if (isInvestment && !raw.alwaysAvailable) {
      const now = new Date();
      const start = raw.investmentStartDate ? new Date(raw.investmentStartDate) : null;
      const end = raw.investmentEndDate ? new Date(raw.investmentEndDate) : null;
      isAvailable = !!(start && end && start <= now && end >= now);
    } else {
      isAvailable = true;
    }

    const alwaysAvailable = isInvestment && !!raw.alwaysAvailable;

    return {
      currencyId: raw.currencyId,
      name: raw.name,
      balance: raw.balance,
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

  validate(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  private updateValidators(): void {
    const isInv = this.isInvestmentSection;
    const always = this.isAlwaysAvailable;
    const rateCtrl = this.form.get('investmentRate');
    const startCtrl = this.form.get('investmentStartDate');
    const endCtrl = this.form.get('investmentEndDate');

    if (isInv) {
      rateCtrl?.setValidators([Validators.required, Validators.min(0.01)]);
      if (always) {
        startCtrl?.clearValidators();
        endCtrl?.clearValidators();
        startCtrl?.setValue(null, { emitEvent: false });
        endCtrl?.setValue(null, { emitEvent: false });
      } else {
        startCtrl?.setValidators(Validators.required);
        endCtrl?.setValidators(Validators.required);
      }
    } else {
      rateCtrl?.clearValidators();
      startCtrl?.clearValidators();
      endCtrl?.clearValidators();
    }
    rateCtrl?.updateValueAndValidity();
    startCtrl?.updateValueAndValidity();
    endCtrl?.updateValueAndValidity();
  }

  private updateIsAvailable(): void {}
}
