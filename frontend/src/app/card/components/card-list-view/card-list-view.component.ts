import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CardListItemComponent } from '../card-list-item/card-list-item.component';
import { CatalogService } from '@common/services/catalog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@common/services/notification.service';
import {
  CARD_STATUS,
  CARD_STATUS_KEYS,
  CardFilter,
  CardFilterOptions,
  CardItem,
  EMPTY_CARD_ITEM,
  PAYMENT_STATUS,
} from '@common/types/cardItem';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService } from '@card/services/card.service';
import { HEADERS } from '@config/messages';

@Component({
  selector: 'app-card-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CardListItemComponent,
    SpinnerComponent,
  ],
  templateUrl: './card-list-view.component.html',
  styleUrl: './card-list-view.component.scss',
  providers: [CatalogService, NotificationService],
})
export class CardListViewComponent implements OnInit {
  // Component variables
  @Input() selectedCard: CardItem = EMPTY_CARD_ITEM;
  @Input() cardId!: number;
  @Output() cardSelected = new EventEmitter<CardItem>();
  isLoading = true;
  error = false;
  cards: CardItem[] = [];
  hasFilter: boolean = false;

  options: CardFilterOptions = {
    entities: [],
    filter: undefined,
    cardStatus: [
      CARD_STATUS.ANY,
      CARD_STATUS.ACTIVE,
      CARD_STATUS.INACTIVE,
      CARD_STATUS.CANCELLED,
    ].map((st: CARD_STATUS) => {
      return { value: st, description: CARD_STATUS_KEYS[st] };
    }),
  };

  constructor(
    private catalogService: CatalogService,
    private cardService: CardService,
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCards();
    this.getFinancingEntities();
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

  openFilter() {
    this.cardService
      .showCardFilterDialog(this.options, this.applyFilter.bind(this))
      .subscribe();
  }

  applyFilter(filter: CardFilter) {
    if (
      filter.entityId === 0 &&
      filter.crediCardType === 2 &&
      filter.active === CARD_STATUS.ANY
    ) {
      this.options.filter = undefined;
      this.hasFilter = false;
    } else {
      this.options.filter = filter;
      this.hasFilter = true;
    }
    this.getCards();
  }

  private pickCard() {
    let card = this.cards[0];
    const cardType = this.router.url.split('/')[2];
    if (cardType === 'cc' && this.cardId) {
      const filtered = this.cards.filter(
        (c: CardItem) => c.isCreditCard && c.id === this.cardId
      );
      if (filtered.length > 0) {
        card = filtered[0];
      }
    } else if (cardType === 'dc' && this.cardId) {
      const filtered = this.cards.filter(
        (c: CardItem) => !c.isCreditCard && c.id === this.cardId
      );
      if (filtered.length > 0) {
        card = filtered[0];
      }
    }
    return card;
  }

  private getCards() {
    this.catalogService.getCards(this.options.filter).subscribe(
      (response) => {
        this.cards = response.data.map((row: any) => {
          return {
            ...row,
            active: row.active as CARD_STATUS,
            isCreditCard: row.isCreditCard === '1',
          };
        });
        if (this.cards.length > 0) {
          const card = this.pickCard();
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

  private getFinancingEntities() {
    this.catalogService.getFinancingEntities().subscribe(
      (response) => {
        this.options.entities = response.data;
        this.options.entities.unshift({ id: 0, name: HEADERS.ANY });
      },
      (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      }
    );
  }
}
