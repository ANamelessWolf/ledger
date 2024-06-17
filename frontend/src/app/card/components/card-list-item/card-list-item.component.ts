import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';
import { HEADERS } from '@config/messages';

@Component({
  selector: 'app-card-list-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
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
    return `**** ${this.data.ending}`
  }

}
