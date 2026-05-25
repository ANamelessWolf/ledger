import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { WalletService } from '../../services/wallet.service';
import { WalletGroupListItemComponent } from '../wallet-group-list-item/wallet-group-list-item.component';
import { WalletGroupItem } from '../../types/wallet.types';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { NotificationService } from '@common/services/notification.service';

@Component({
  selector: 'app-wallet-group-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    WalletGroupListItemComponent,
    SpinnerComponent,
  ],
  templateUrl: './wallet-group-list.component.html',
  styleUrl: './wallet-group-list.component.scss',
  providers: [NotificationService],
})
export class WalletGroupListComponent implements OnInit {
  @Output() groupSelected = new EventEmitter<WalletGroupItem | null>();
  @Output() addRequested = new EventEmitter<void>();

  isLoading = true;
  groups: (WalletGroupItem & { isSelected: boolean })[] = [];

  constructor(
    private walletService: WalletService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  onGroupClick(group: WalletGroupItem & { isSelected: boolean }): void {
    const wasSelected = group.isSelected;
    this.groups.forEach((g) => (g.isSelected = false));
    group.isSelected = !wasSelected;
    this.groupSelected.emit(group.isSelected ? group : null);
  }

  onAdd(): void {
    this.addRequested.emit();
  }

  loadGroups(): void {
    this.isLoading = true;
    this.walletService.getWalletGroups().subscribe({
      next: (response: any) => {
        this.groups = response.data.map((g: WalletGroupItem) => ({
          ...g,
          isSelected: false,
        }));
        if (this.groups.length > 0) {
          this.groups[0].isSelected = true;
          this.groupSelected.emit(this.groups[0]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
