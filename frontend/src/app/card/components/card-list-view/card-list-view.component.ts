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
} from '@common/types/cardItem';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { Router } from '@angular/router';
import { CardService } from '@card/services/card.service';
import { HEADERS } from '@config/messages';
import { CatalogItem } from '@common/types/catalogTypes';

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
  @Input() selectedCard: CardItem = EMPTY_CARD_ITEM;
  @Input() cardId!: number;
  @Output() cardSelected = new EventEmitter<CardItem>();

  isLoading = true;
  error = false;
  cards: CardItem[] = [];
  hasFilter: boolean = false;

  private allEntities: CatalogItem[] = [];

  options: CardFilterOptions = {
    entities: [],
    filter: undefined,
    cardStatus: [
      CARD_STATUS.ANY,
      CARD_STATUS.ACTIVE,
      CARD_STATUS.INACTIVE,
      CARD_STATUS.CANCELLED,
    ].map((st: CARD_STATUS) => ({ value: st, description: CARD_STATUS_KEYS[st] })),
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
    this.cardSelected.emit(card.isSelected ? card : EMPTY_CARD_ITEM);
  }

  openFilter() {
    this.cardService
      .showCardFilterDialog(this.options, this.applyFilter.bind(this))
      .subscribe();
  }

  applyFilter(filter: CardFilter) {
    const isDefault =
      filter.entityId === 0 &&
      filter.crediCardType === 2 &&
      filter.active === CARD_STATUS.ANY &&
      !filter.showCancelled;

    this.options.filter = isDefault ? undefined : filter;
    this.hasFilter = !isDefault;
    this.getCards();
  }

  private pickCard(): CardItem {
    let card = this.cards[0];
    const cardType = this.router.url.split('/')[2];
    if (cardType === 'cc' && this.cardId) {
      const filtered = this.cards.filter((c) => c.isCreditCard && c.id === this.cardId);
      if (filtered.length > 0) card = filtered[0];
    } else if (cardType === 'dc' && this.cardId) {
      const filtered = this.cards.filter((c) => !c.isCreditCard && c.id === this.cardId);
      if (filtered.length > 0) card = filtered[0];
    }
    return card;
  }

  private updateEntityOptions(): void {
    const entityIds = new Set(this.cards.map((c) => c.entityId));
    this.options.entities = this.allEntities.filter(
      (e) => e.id === 0 || entityIds.has(e.id)
    );
  }

  private getCards() {
    this.catalogService.getCards(this.options.filter).subscribe({
      next: (response) => {
        let rows: CardItem[] = response.data.map((row: any) => ({
          ...row,
          active: row.active as CARD_STATUS,
          isCreditCard: row.isCreditCard === '1',
        }));

        if (!this.options.filter?.showCancelled) {
          rows = rows.filter((c) => c.active !== CARD_STATUS.CANCELLED);
        }

        this.cards = rows;
        this.updateEntityOptions();

        if (this.cards.length > 0) {
          const card = this.pickCard();
          card.isSelected = true;
          this.cardSelected.emit(card);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      },
      complete: () => { this.isLoading = false; },
    });
  }

  private getFinancingEntities() {
    this.catalogService.getFinancingEntities().subscribe({
      next: (response) => {
        this.allEntities = [{ id: 0, name: HEADERS.ANY }, ...response.data];
        this.options.entities = this.allEntities;
      },
      error: (err: HttpErrorResponse) => {
        this.error = true;
        this.notifService.showError(err);
      },
    });
  }
}
