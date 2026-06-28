import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { EndInvestmentPayload, FinancingSection } from '../../types/account.types';

export interface EndInvestmentModalData {
  section: FinancingSection;
  allSections: FinancingSection[];
  projectedEarnings: number;
  onValidate?: () => boolean;
  result?: EndInvestmentPayload;
}

@Component({
  selector: 'app-end-investment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
  ],
  templateUrl: './end-investment-modal.component.html',
  styleUrl: './end-investment-modal.component.scss',
})
export class EndInvestmentModalComponent implements OnInit {
  @Input() data!: EndInvestmentModalData;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const hasMain = this.mainSection !== null;
    const defaultDest = hasMain ? 'account' : this.otherSections.length > 0 ? 'section' : 'account';

    this.form = this.fb.group({
      earnings: [
        this.data.projectedEarnings,
        [Validators.required, Validators.min(0)],
      ],
      destinationType: [defaultDest, Validators.required],
      targetSectionId: [null],
    });

    this.form.get('destinationType')?.valueChanges.subscribe(() => this.updateValidators());
    this.updateValidators();

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (this.form.valid) {
        this.data.result = this.buildResult();
        return true;
      }
      return false;
    };
  }

  get section(): FinancingSection {
    return this.data.section;
  }

  get mainSection(): FinancingSection | null {
    return this.data.allSections.find((s) => s.name === 'main') ?? null;
  }

  get otherSections(): FinancingSection[] {
    return this.data.allSections.filter(
      (s) => s.id !== this.data.section.id && s.name !== 'main'
    );
  }

  get destinationType(): string {
    return this.form.get('destinationType')?.value ?? '';
  }

  get totalToMove(): number {
    const earnings = Number(this.form.get('earnings')?.value ?? 0);
    return this.section.balance + (isNaN(earnings) ? 0 : earnings);
  }

  private buildResult(): EndInvestmentPayload {
    const raw = this.form.getRawValue();
    const payload: EndInvestmentPayload = {
      earnings: raw.earnings,
      destinationType: raw.destinationType,
    };
    if (raw.destinationType === 'section') {
      payload.targetSectionId = raw.targetSectionId;
    }
    return payload;
  }

  private updateValidators(): void {
    const targetCtrl = this.form.get('targetSectionId');
    targetCtrl?.clearValidators();
    if (this.destinationType === 'section') {
      targetCtrl?.setValidators(Validators.required);
    }
    targetCtrl?.updateValueAndValidity({ emitEvent: false });
  }
}
