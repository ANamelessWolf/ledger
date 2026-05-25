import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WalletGroupItem } from '../../types/wallet.types';

@Component({
  selector: 'app-wallet-group-list-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './wallet-group-list-item.component.html',
  styleUrl: './wallet-group-list-item.component.scss',
})
export class WalletGroupListItemComponent {
  @Input() isSelected: boolean = false;
  @Input() data!: WalletGroupItem;

  get currencySummary(): string {
    if (!this.data?.currencies?.length) return 'No currencies';
    return this.data.currencies.join(', ');
  }
}
