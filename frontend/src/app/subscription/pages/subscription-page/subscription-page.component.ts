import { Component } from '@angular/core';
import { SubscriptionDashboardComponent } from '@subscription/components/subscription-dashboard/subscription-dashboard.component';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [SubscriptionDashboardComponent],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss',
})
export class SubscriptionPageComponent {}
