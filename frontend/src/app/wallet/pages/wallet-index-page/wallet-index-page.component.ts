import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';

@Component({
  selector: 'app-wallet-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    SearchBarComponent,
  ],
  templateUrl: './wallet-index-page.component.html',
  styleUrl: './wallet-index-page.component.scss',
})
export class WalletIndexPageComponent {
  hasFilter: boolean = true;

  onSearch(event: any) {}

  openFilter() {}

  addWallet() {}
}
