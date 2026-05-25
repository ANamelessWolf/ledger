import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WalletSummaryData {
  groupCount: number;
  walletCount: number;
  currencyCount: number;
}

@Component({
  selector: 'app-wallet-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-summary.component.html',
  styleUrl: './wallet-summary.component.scss',
})
export class WalletSummaryComponent {
  @Input() summary: WalletSummaryData = { groupCount: 0, walletCount: 0, currencyCount: 0 };
}
