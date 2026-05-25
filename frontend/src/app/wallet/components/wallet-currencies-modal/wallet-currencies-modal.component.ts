import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CurrencyItem, WalletMemberItem } from '../../types/wallet.types';
import { CurrencyDualListComponent } from '../currency-dual-list/currency-dual-list.component';

export interface WalletCurrenciesModalData {
  addedMembers: WalletMemberItem[];
  availableCurrencies: CurrencyItem[];
  onValidate?: () => boolean;
  result?: {
    toAdd: CurrencyItem[];
    toRemove: WalletMemberItem[];
  };
}

@Component({
  selector: 'app-wallet-currencies-modal',
  standalone: true,
  imports: [CommonModule, CurrencyDualListComponent],
  templateUrl: './wallet-currencies-modal.component.html',
  styleUrl: './wallet-currencies-modal.component.scss',
})
export class WalletCurrenciesModalComponent implements OnInit {
  @Input() data!: WalletCurrenciesModalData;
  @ViewChild(CurrencyDualListComponent) dualList!: CurrencyDualListComponent;

  initialAdded: CurrencyItem[] = [];
  initialAvailable: CurrencyItem[] = [];

  ngOnInit(): void {
    this.initialAdded = this.data.addedMembers.map((m) => ({
      id: m.currencyId,
      name: m.currencyName,
      symbol: m.currencySymbol,
      conversion: 0,
      isDefault: false,
    }));
    this.initialAvailable = [...this.data.availableCurrencies];

    this.data.onValidate = () => {
      if (this.dualList.added.length === 0) return false;

      const originalIds = new Set(this.data.addedMembers.map((m) => m.currencyId));
      const currentIds = new Set(this.dualList.added.map((c) => c.id));
      const removedIds = [...originalIds].filter((id) => !currentIds.has(id));

      this.data.result = {
        toAdd: this.dualList.pendingAdd,
        toRemove: this.data.addedMembers.filter((m) => removedIds.includes(m.currencyId)),
      };
      return true;
    };
  }
}
