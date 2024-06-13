import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';

@Component({
  selector: 'app-side-screen',
  standalone: true,
  imports: [RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    NavMenuComponent],
  templateUrl: './side-screen.component.html',
  styleUrl: './side-screen.component.scss',
})
export class SideScreenComponent {}
