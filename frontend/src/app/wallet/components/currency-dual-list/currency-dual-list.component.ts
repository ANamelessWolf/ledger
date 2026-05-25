import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyItem } from '../../types/wallet.types';

@Component({
  selector: 'app-currency-dual-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './currency-dual-list.component.html',
  styleUrl: './currency-dual-list.component.scss',
})
export class CurrencyDualListComponent implements OnInit {
  @Input() initialAdded: CurrencyItem[] = [];
  @Input() initialAvailable: CurrencyItem[] = [];
  @Input() showPendingBadge = true;

  added: CurrencyItem[] = [];
  available: CurrencyItem[] = [];
  pendingAdd: CurrencyItem[] = [];

  ngOnInit(): void {
    this.added = [...this.initialAdded];
    this.available = [...this.initialAvailable];
  }

  isPending(currency: CurrencyItem): boolean {
    return this.pendingAdd.some((c) => c.id === currency.id);
  }

  addCurrency(currency: CurrencyItem): void {
    this.available = this.available.filter((c) => c.id !== currency.id);
    this.added = [...this.added, currency];
    const wasOriginal = this.initialAdded.some((c) => c.id === currency.id);
    if (!wasOriginal) {
      this.pendingAdd = [...this.pendingAdd, currency];
    }
  }

  removeCurrency(currency: CurrencyItem): void {
    this.added = this.added.filter((c) => c.id !== currency.id);
    this.available = [...this.available, currency];
    this.pendingAdd = this.pendingAdd.filter((c) => c.id !== currency.id);
  }
}
