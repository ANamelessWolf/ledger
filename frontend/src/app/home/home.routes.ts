import { Routes } from '@angular/router';
import { HomePageComponent } from '@home/pages/home-page/home-page.component';

export const HOME_BASE = '';

export const homePaths = {
  index: '',
};

export const HOME_ROUTES: Routes = [
  {
    path: homePaths.index,
    component: HomePageComponent,
  },
];
