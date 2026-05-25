import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CATALOG_CONFIGS, SETTINGS_SECTIONS } from '../../types/catalog-config.types';

@Component({
  selector: 'app-settings-hub-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './settings-hub-page.component.html',
  styleUrl: './settings-hub-page.component.scss',
})
export class SettingsHubPageComponent {
  sections = SETTINGS_SECTIONS;
  configs = CATALOG_CONFIGS;
}
