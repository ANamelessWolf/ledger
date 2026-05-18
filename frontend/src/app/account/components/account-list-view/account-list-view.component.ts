import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountService } from '../../services/account.service';
import { AccountListItemComponent } from '../account-list-item/account-list-item.component';
import { FinancingAccountItem } from '../../types/account.types';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { NotificationService } from '@common/services/notification.service';

@Component({
  selector: 'app-account-list-view',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    AccountListItemComponent,
    SpinnerComponent,
  ],
  templateUrl: './account-list-view.component.html',
  styleUrl: './account-list-view.component.scss',
  providers: [NotificationService],
})
export class AccountListViewComponent implements OnInit {
  @Output() accountSelected = new EventEmitter<FinancingAccountItem | null>();
  @Output() addRequested = new EventEmitter<void>();

  isLoading = true;
  accounts: (FinancingAccountItem & { isSelected: boolean })[] = [];

  constructor(
    private accountService: AccountService,
    private notifService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  onAccountClick(account: FinancingAccountItem & { isSelected: boolean }): void {
    const wasSelected = account.isSelected;
    this.accounts.forEach((a) => (a.isSelected = false));
    account.isSelected = !wasSelected;
    this.accountSelected.emit(account.isSelected ? account : null);
  }

  onAdd(): void {
    this.addRequested.emit();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe({
      next: (response) => {
        this.accounts = response.data.map((a: FinancingAccountItem) => ({
          ...a,
          isSelected: false,
        }));
        if (this.accounts.length > 0) {
          this.accounts[0].isSelected = true;
          this.accountSelected.emit(this.accounts[0]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
