import { Routes } from '@angular/router';
import { SettingsLayoutComponent } from './components/settings-layout/settings-layout.component';
import { SettingsHubPageComponent } from './pages/settings-hub-page/settings-hub-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';

export const SETTINGS_BASE = 'settings';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsLayoutComponent,
    children: [
      { path: '',                      redirectTo: 'hub', pathMatch: 'full' },
      { path: 'hub',                   component: SettingsHubPageComponent },
      { path: 'catalog/:catalogId',    component: CatalogPageComponent     },
    ],
  },
];
