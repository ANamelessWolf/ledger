import { Component, Input } from '@angular/core';
import { CardType } from '@common/types/cardItem';
import { NgIf } from '@angular/common';

const NETWORK_LOGOS: Record<CardType, string> = {
  [CardType.AMEX]:        'assets/icons/payment/amex_logo.svg',
  [CardType.MASTER_CARD]: 'assets/icons/payment/mastercard-logo.svg',
  [CardType.VISA]:        'assets/icons/payment/visa_logo.svg',
  [CardType.DISCOVERY]:   'assets/icons/payment/discover_logo.svg',
  [CardType.OTHER]:       'assets/icons/payment/default_logo.svg',
};

// Per-network sizing tweaks so each logo feels balanced on the card
const NETWORK_CLASS: Record<CardType, string> = {
  [CardType.VISA]:        'net-visa',
  [CardType.MASTER_CARD]: 'net-mastercard',
  [CardType.AMEX]:        'net-amex',
  [CardType.DISCOVERY]:   'net-discover',
  [CardType.OTHER]:       'net-default',
};

@Component({
  selector: 'app-card-miniature',
  standalone: true,
  imports: [NgIf],
  templateUrl: './card-miniature.component.html',
  styleUrl: './card-miniature.component.scss',
})
export class CardMiniatureComponent {
  @Input() color = 'white';
  @Input() banking: string = '';
  @Input() expiration: string = '';
  @Input() ending: string = '';
  @Input() cardType: CardType = CardType.OTHER;
  @Input() miniMode: boolean = false;

  get networkLogo(): string {
    return NETWORK_LOGOS[this.cardType] ?? NETWORK_LOGOS[CardType.OTHER];
  }

  get networkClass(): string {
    return NETWORK_CLASS[this.cardType] ?? 'net-default';
  }

  get endingCard(): string {
    if (this.banking === 'American Express') {
      return `XXXX XXXXXX ${this.ending}`;
    }
    return `XXXX XXXX XXXX ${this.ending}`;
  }
}
