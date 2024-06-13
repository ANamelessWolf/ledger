import { Routes } from '@angular/router';
import { CardIndexPageComponent } from './pages/card-index-page/card-index-page.component';

export const CARD_BASE = 'cards';

export const cardsPaths = {
  index: '',
};

export const CARD_ROUTES: Routes = [
  {
    path: cardsPaths.index,
    component: CardIndexPageComponent,
  },
];
