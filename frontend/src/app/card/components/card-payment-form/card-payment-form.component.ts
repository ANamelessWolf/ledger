import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '@common/types/DialogData';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SUMMARY,
} from '@common/types/creditCardSummary';
import { toRequestFormat } from '@common/utils/formatUtils';
import { PAYMENT_STATUS } from '@common/types/cardItem';
import {
  CreditCardPaymentBody,
  CreditCardPaymentRequest,
} from '@common/types/cardPayment';

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
    DialogModule,
    MatButtonModule,
  ],
  templateUrl: './card-payment-form.component.html',
  styleUrl: './card-payment-form.component.scss',
})
export class CardPaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  card: CreditCardSummary = EMPTY_CREDIT_CARD_SUMMARY;
  header: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<CardPaymentFormComponent>,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      totalToPay: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      payDate: [new Date(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.card = this.dialogData.card;
    this.header = this.dialogData.header;
  }

  get totalToPay() {
    return this.paymentForm.get('totalToPay');
  }

  get payDate() {
    return this.paymentForm.get('payDate');
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      const payDate = new Date(this.paymentForm.value.payDate);
      const id = this.card.id;
      const body: CreditCardPaymentBody = {
        total: +this.paymentForm.value.totalToPay,
        payDate: toRequestFormat(payDate),
        cutDate: toRequestFormat(new Date(this.card.status.payment.startDate)),
        dueDate: toRequestFormat(new Date(this.card.status.payment.dueDate)),
      };
      this.dialogData.card.status.status = PAYMENT_STATUS.PAID;
      this.dialogData.formSubmitted({ id, body });
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
