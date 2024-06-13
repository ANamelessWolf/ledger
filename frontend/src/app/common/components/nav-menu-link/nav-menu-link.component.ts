import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-menu-link',
  standalone: true,
  imports: [
    MatIcon,
    RouterModule
  ],
  templateUrl: './nav-menu-link.component.html',
  styleUrl: './nav-menu-link.component.scss'
})
export class NavMenuLinkComponent {

  @Input() header: string = '';
  @Input() route: string = '';
  @Input() icon: string = '';

}
