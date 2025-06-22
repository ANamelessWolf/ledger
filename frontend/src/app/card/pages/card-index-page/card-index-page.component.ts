import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardListViewComponent } from '@card/components/card-list-view/card-list-view.component';
import { CardSummaryComponent } from '@card/components/card-summary/card-summary.component';
import { CreditCardSpendingChartComponent } from '@card/components/credit-card-spending-chart/credit-card-spending-chart.component';
import { CardService } from '@card/services/card.service';
import { NotificationService } from '@common/services/notification.service';
import { CardItem, EMPTY_CARD_ITEM } from '@common/types/cardItem';
import {
  CreditCardSpending,
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SPENDING,
} from '@common/types/creditCardSummary';
import {
  DebitCardSummary,
  EMPTY_DEBIT_CARD_SUMMARY,
} from '@common/types/debitCardSummary';

@Component({
  selector: 'app-card-index-page',
  standalone: true,
  imports: [
    CommonModule,
    CardListViewComponent,
    CardSummaryComponent,
    CreditCardSpendingChartComponent
  ],
  templateUrl: './card-index-page.component.html',
  styleUrl: './card-index-page.component.scss',
  providers: [CardService, NotificationService],
})
export class CardIndexPageComponent implements OnInit {
  cardId!: number;
  selectedCard: CardItem = EMPTY_CARD_ITEM;
  cardSummary: CreditCardSummary | DebitCardSummary | null = null;
  creditCardSpending: CreditCardSpending = EMPTY_CREDIT_CARD_SPENDING;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private cardService: CardService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.route.paramMap.forEach((p) => {
      this.cardId = +(p.get('id') || '');
    });
  }

  onCardSelected(card: CardItem) {
    this.selectedCard = card;
    if (card.id > 0 && card.isCreditCard) {
      this.getCreditCardSummary(card.id);
      this.getSpendingHistory(card.id);
    } else if (card.id > 0 && !card.isCreditCard) {
      this.getDebitCardSummary(card.id);
    } else {
      this.cardSummary = null;
    }
  }

  private getCreditCardSummary(id: number) {
    this.cardService.getCreditCardSummaryById(id).subscribe(
      (response) => {
        this.cardSummary = response.data;
        console.log(this.cardSummary);
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

  private getSpendingHistory(id: number) {
    this.cardService.getCreditCardSpendingHistoryById(id).subscribe(
      (response) => {
        this.creditCardSpending = response.data;
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

  private getDebitCardSummary(id: number) {
    this.cardService.getDebitCardSummaryById(id).subscribe(
      (response) => {
        this.cardSummary = response.data;
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
