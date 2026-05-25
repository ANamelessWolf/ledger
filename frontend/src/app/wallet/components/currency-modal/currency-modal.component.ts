import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyItem, CreateCurrencyPayload } from '../../types/wallet.types';

export interface CurrencyModalData {
  mode: 'add' | 'edit';
  currency?: CurrencyItem;
  onValidate?: () => boolean;
  result?: CreateCurrencyPayload;
}

@Component({
  selector: 'app-currency-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './currency-modal.component.html',
  styleUrl: './currency-modal.component.scss',
})
export class CurrencyModalComponent implements OnInit {
  @Input() data!: CurrencyModalData;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.currency?.name ?? '', [Validators.required, Validators.maxLength(20)]],
      symbol: [this.data.currency?.symbol ?? '', [Validators.required, Validators.maxLength(3)]],
      conversion: [
        this.data.currency?.conversion ?? '',
        [Validators.required, Validators.min(0.000001)],
      ],
    });

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (!this.form.valid) return false;
      const { name, symbol, conversion } = this.form.value;
      this.data.result = { name, symbol, conversion: Number(conversion) };
      return true;
    };
  }
}
