import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_SETTINGS } from '@config/constants';

@Component({
  selector: 'app-nav-menu-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-menu-footer.component.html',
  styleUrl: './nav-menu-footer.component.scss',
})
export class NavMenuFooterComponent {
  user_name: string = APP_SETTINGS.USER_NAME;
  email: string = APP_SETTINGS.CONTACT_EMAIL;
  company: string = APP_SETTINGS.COMPANY_NAME;
}
