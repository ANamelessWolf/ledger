import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { NavMenuLinkComponent } from '@common/components/nav-menu-link/nav-menu-link.component';
import { MenuLinkType } from '@common/common-interfaces';
import { NavMenuFooterComponent } from '../nav-menu-footer/nav-menu-footer.component';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIcon,
    NavMenuLinkComponent,
    NavMenuFooterComponent,
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent {
  menu_links: MenuLinkType[] = [
    { header: 'Home', route: '/', icon: 'home', exact: true },
    { header: 'Cards', route: '/cards', icon: 'credit_card', exact: false },
    { header: 'Expenses', route: '/expenses', icon: 'payments', exact: false },
    { header: 'Wallets', route: '/wallets', icon: 'wallet', exact: false },
    { header: '0% Interest Financing', route: '/monoint', icon: 'percent', exact: false },
    { header: 'Subscriptions', route: '/subscription', icon: 'receipt', exact: false },
  ];
}
