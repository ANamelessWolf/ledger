import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FinancingAccountDetail } from '../../types/account.types';

export interface EditAccountModalData {
  detail: FinancingAccountDetail;
  onValidate?: () => boolean;
  result?: { name: string; description: string; mainBalance: number };
}

@Component({
  selector: 'app-edit-account-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './edit-account-modal.component.html',
  styleUrl: './edit-account-modal.component.scss',
})
export class EditAccountModalComponent implements OnInit {
  @Input() data!: EditAccountModalData;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const { account, sections } = this.data.detail;
    const mainSection = sections.find((s) => s.name === 'main');

    this.form = this.fb.group({
      name: [account.name, Validators.required],
      description: [account.description],
      mainBalance: [mainSection?.balance ?? 0, [Validators.required, Validators.min(0)]],
    });

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (this.form.valid) {
        const { name, description, mainBalance } = this.form.value;
        this.data.result = { name, description, mainBalance: Number(mainBalance) };
        return true;
      }
      return false;
    };
  }

  get currencySymbol(): string {
    const mainSection = this.data.detail.sections.find((s) => s.name === 'main');
    return mainSection?.currencySymbol ?? '';
  }

  get totalBalance(): number {
    return this.data.detail.totalBalance;
  }

  get defaultCurrencySymbol(): string {
    return this.data.detail.defaultCurrencySymbol;
  }
}
