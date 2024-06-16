import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardListViewComponent } from '@card/components/card-list-view/card-list-view.component';
import { CardSummaryComponent } from '@card/components/card-summary/card-summary.component';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';

@Component({
  selector: 'app-card-index-page',
  standalone: true,
  imports: [
    CommonModule,
    CardListViewComponent,
    CardSummaryComponent
  ],
  templateUrl: './card-index-page.component.html',
  styleUrl: './card-index-page.component.scss',
})
export class CardIndexPageComponent implements OnInit {
  selectedCard: CardItem = EMPTY_CARD_ITEM;

  ngOnInit() {
    // Any initial logic if needed
  }

  onCardSelected(card: CardItem) {
    this.selectedCard = card;
  }
}
