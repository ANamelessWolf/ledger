import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MATERIAL_COMPONENTS } from './shared/material/material.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    FontAwesomeModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';
  constructor() {
    // Register the required components for Chart.js
    Chart.register(...registerables);
  }
}
