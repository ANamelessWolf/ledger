import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CardListItemComponent } from '../card-list-item/card-list-item.component';
import { CatalogService } from '@common/services/catalog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@common/services/notification.service';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';

@Component({
  selector: 'app-card-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CardListItemComponent,
    SpinnerComponent
  ],
  templateUrl: './card-list-view.component.html',
  styleUrl: './card-list-view.component.scss',
  providers: [CatalogService, NotificationService],
})
export class CardListViewComponent implements OnInit {
  // Component variables
  @Input() selectedCard: CardItem = EMPTY_CARD_ITEM;
  @Output() cardSelected = new EventEmitter<CardItem>();
  isLoading = true;
  error = false;
  cards: CardItem[] = [];

  constructor(
    private catalogService: CatalogService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getCatalogs();
  }

  onCardClick(card: CardItem) {
    const status = card.isSelected;
    this.cards.forEach((c) => (c.isSelected = false));
    card.isSelected = !status;
    if (card.isSelected) {
      this.cardSelected.emit(card);
    } else {
      this.cardSelected.emit(EMPTY_CARD_ITEM);
    }
  }

  private getCatalogs() {
    this.catalogService.getCards().subscribe(
      (response) => {
        this.cards = response.data.map((row: any) => {
          return {
            ...row,
            active: row.active === 1,
            isCreditCard: row.isCreditCard === 1,
          };
        });
        if (this.cards.length > 0) {
          const card = this.cards[0];
          card.isSelected = true;
          this.cardSelected.emit(card);
        }
      },
      (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      },
      //Complete
      () => {
        this.isLoading = false;
      }
    );
  }
}
