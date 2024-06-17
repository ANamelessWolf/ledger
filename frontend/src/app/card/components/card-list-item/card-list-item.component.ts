import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {
  CardItem,
  EMPTY_CARD_ITEM,
  PAYMENT_STATUS,
} from '@common/types/cardItem';
import { HEADERS } from '@config/messages';

@Component({
  selector: 'app-card-list-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  templateUrl: './card-list-item.component.html',
  styleUrl: './card-list-item.component.scss',
})
export class CardListItemComponent {
  @Input() isSelected: boolean = false;
  @Input() data: CardItem = EMPTY_CARD_ITEM;

  get cardType() {
    if (this.data.isCreditCard) {
      return HEADERS.C_CARD;
    }
    return HEADERS.D_CARD;
  }

  get cardStatus() {
    if (this.data.active) {
      return HEADERS.ACT;
    }
    return HEADERS.N_ACT;
  }

  get cardEnding() {
    return `**** ${this.data.ending}`;
  }

  get statusStyle() {
    if (PAYMENT_STATUS.OVERDUE === this.data.status) {
      return 'status-error';
    } else if (PAYMENT_STATUS.PENDING === this.data.status) {
      return 'status-warning';
    } else if (PAYMENT_STATUS.PAID === this.data.status) {
      return 'status-ok';
    } else {
      return 'status-other';
    }
  }
}
