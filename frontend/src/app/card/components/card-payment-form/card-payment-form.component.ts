import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { toRequestFormat } from '@common/utils/formatUtils';
import { PAYMENT_STATUS } from '@common/types/cardItem';
import { CreditCardPaymentBody, CreditCardPaymentRequest } from '@common/types/cardPayment';
import { CurrencyInputDirective } from '@common/directives/currency-input.directive';

export interface CardPaymentData {
  card: CreditCardSummary;
  isValid: () => boolean;
  getResult: () => CreditCardPaymentRequest;
}

@Component({
  selector: 'app-card-payment-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CurrencyInputDirective,
  ],
  templateUrl: './card-payment-form.component.html',
  styleUrl: './card-payment-form.component.scss',
})
export class CardPaymentFormComponent implements OnInit {
  // Set by dialog-wrapper
  data!: CardPaymentData;

  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      totalToPay: [null, [Validators.required]],
      payDate:    [new Date(), Validators.required],
    });

    this.data.isValid   = () => this.paymentForm.valid;
    this.data.getResult = () => this.buildResult();
  }

  get totalToPay() { return this.paymentForm.get('totalToPay'); }
  get payDate()    { return this.paymentForm.get('payDate'); }

  private buildResult(): CreditCardPaymentRequest {
    const payDate = new Date(this.paymentForm.value.payDate);
    const body: CreditCardPaymentBody = {
      total:   this.paymentForm.value.totalToPay,
      payDate: toRequestFormat(payDate),
      cutDate: toRequestFormat(new Date(this.data.card.status.payment.startDate)),
      dueDate: toRequestFormat(new Date(this.data.card.status.payment.dueDate)),
    };
    this.data.card.status.status = PAYMENT_STATUS.PAID;
    return { id: this.data.card.id, body };
  }
}
