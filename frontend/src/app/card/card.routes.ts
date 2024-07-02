import { Routes } from '@angular/router';
import { CardIndexPageComponent } from './pages/card-index-page/card-index-page.component';

export const CARD_BASE = 'cards';

export const cardsPaths = {
  index: '',
  credit_card_view: 'cc/:id',
  debit_card_view: 'dc/:id',
};

export const CARD_ROUTES: Routes = [
  {
    path: cardsPaths.index,
    component: CardIndexPageComponent,
  },
  {
    path: cardsPaths.credit_card_view,
    component: CardIndexPageComponent,
  },
  {
    path: cardsPaths.debit_card_view,
    component: CardIndexPageComponent,
  },
];
