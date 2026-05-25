import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InstallmentPayment } from '@moNoInt/types/monthlyNoInterest';
import { Observable } from 'rxjs';

export interface PaymentListFormData {
  installmentId: number;
  payments: InstallmentPayment[];
  pay: (installmentId: number, paymentId: number) => Observable<any>;
  isValid: () => boolean;
  getResult: () => any;
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent implements OnInit {
  data!: PaymentListFormData;

  payments: InstallmentPayment[] = [];
  isProcessing = false;
  error = false;

  ngOnInit(): void {
    this.payments = [...this.data.payments];
    this.data.isValid   = () => true;
    this.data.getResult = () => null;
  }

  pay(row: InstallmentPayment): void {
    this.isProcessing = true;
    this.error = false;
    this.data.pay(this.data.installmentId, row.paymentId).subscribe({
      next: () => {
        row.isPaid = true;
        this.payments = [...this.payments];
        this.isProcessing = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err.message);
        this.error = true;
        this.isProcessing = false;
      },
    });
  }

  get paidCount(): number    { return this.payments.filter(p => p.isPaid).length; }
  get pendingCount(): number { return this.payments.filter(p => !p.isPaid).length; }
}
