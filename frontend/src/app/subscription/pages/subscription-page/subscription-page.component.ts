import { Component } from '@angular/core';
import { SubscriptionDashboardComponent } from '@subscription/components/subscription-dashboard/subscription-dashboard.component';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [PageLayoutComponent, SubscriptionDashboardComponent],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss',
})
export class SubscriptionPageComponent {
  onSearch(searchTerm: string) {
    console.log('searching for:', searchTerm);
  }

  addSubscription() {
    console.log('adding subscription');
  }

  openFilter() {
    console.log('opening filter');
  }

}
