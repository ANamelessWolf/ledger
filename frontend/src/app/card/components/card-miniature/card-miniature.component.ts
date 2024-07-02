import { Component, Input } from '@angular/core';
import { CardType } from '@common/types/cardItem';
import { IconDefinition, FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faCcMastercard,
  faCcAmex,
  faCcVisa,
  faCcDiscover,
} from '@fortawesome/free-brands-svg-icons';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-card-miniature',
  standalone: true,
  imports: [FaIconComponent],
  templateUrl: './card-miniature.component.html',
  styleUrl: './card-miniature.component.scss',
})
export class CardMiniatureComponent {
  @Input() color = 'white';
  @Input() banking: String = '';
  @Input() expiration: String = '';
  @Input() ending: String = '';
  @Input() cardType: CardType = CardType.OTHER;

  get iconCard(): IconDefinition {
    let icon: IconDefinition = faCreditCard;
    switch (this.cardType) {
      case CardType.AMEX:
        icon = faCcAmex;
        break;
      case CardType.DISCOVERY:
        icon = faCcDiscover;
        break;
      case CardType.MASTER_CARD:
        icon = faCcMastercard;
        break;
      case CardType.VISA:
        icon = faCcVisa;
        break;
    }
    return icon;
  }

  get endingCard(): string {
    if (this.banking === 'American Express') {
      return `XXXX XXXXXX ${this.ending}`;
    }
    return `XXXX XXXX XXXX ${this.ending}`;
  }
}
