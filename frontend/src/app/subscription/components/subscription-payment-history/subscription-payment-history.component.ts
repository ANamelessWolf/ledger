import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentHistoryItem } from '@subscription/types/subscriptionTypes';

export interface SubscriptionPaymentHistoryFormData {
  subscriptionId: number;
  subscriptionName: string;
  onLoadHistory: (callback: (items: PaymentHistoryItem[]) => void) => void;
  onPaymentRemoved: (paymentId: number) => void;
  close: () => void;
  isValid: () => boolean;
  getResult: () => any;
  reset: () => void;
}

@Component({
  selector: 'app-subscription-payment-history',
  standalone: true,
  imports: [
    CommonModule,
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
  data!: SubscriptionPaymentHistoryFormData;
  history: PaymentHistoryItem[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.data.isValid   = () => true;
    this.data.getResult = () => null;
    this.data.reset     = () => {};

    this.data.onLoadHistory((items) => {
      this.history   = items;
      this.isLoading = false;
    });
  }

  removePayment(item: PaymentHistoryItem): void {
    this.data.onPaymentRemoved(item.id);
    this.history = this.history.filter((h) => h.id !== item.id);
  }
}
