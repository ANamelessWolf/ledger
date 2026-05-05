import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentHistoryItem, PaymentHistoryDialogData } from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './subscription-payment-history.component.html',
  styleUrl: './subscription-payment-history.component.scss',
})
export class SubscriptionPaymentHistoryComponent implements OnInit {
  history: PaymentHistoryItem[] = [];
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<SubscriptionPaymentHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentHistoryDialogData
  ) {}

  ngOnInit(): void {
    this.data.onLoadHistory((items) => {
      this.history = items;
      this.isLoading = false;
    });
  }

  removePayment(item: PaymentHistoryItem): void {
    this.data.onPaymentRemoved(item.id);
    this.history = this.history.filter((h) => h.id !== item.id);
  }

  close(): void {
    this.dialogRef.close();
  }
}
