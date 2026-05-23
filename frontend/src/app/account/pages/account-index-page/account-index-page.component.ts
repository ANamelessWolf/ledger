import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountListViewComponent } from '../../components/account-list-view/account-list-view.component';
import { SavingsDetailComponent } from '../../components/savings-detail/savings-detail.component';
import { InvestmentDetailComponent } from '../../components/investment-detail/investment-detail.component';
import { AddAccountWizardComponent } from '../../components/add-account-wizard/add-account-wizard.component';
import { AccountService } from '../../services/account.service';
import { CatalogService } from '@common/services/catalog.service';
import {
  FinancingAccountItem,
  FinancingAccountDetail,
} from '../../types/account.types';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { NotificationService } from '@common/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-account-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    AccountListViewComponent,
    SavingsDetailComponent,
    InvestmentDetailComponent,
    SpinnerComponent,
  ],
  templateUrl: './account-index-page.component.html',
  styleUrl: './account-index-page.component.scss',
  providers: [NotificationService],
})
export class AccountIndexPageComponent {
  @ViewChild(AccountListViewComponent) listView!: AccountListViewComponent;

  selectedAccount: FinancingAccountItem | null = null;
  accountDetail: FinancingAccountDetail | null = null;
  isLoadingDetail = false;

  constructor(
    private accountService: AccountService,
    private catalogService: CatalogService,
    private dialog: MatDialog,
    private notifService: NotificationService
  ) {}

  get isSavings(): boolean {
    return (this.accountDetail?.account?.accountType ?? this.selectedAccount?.accountType) === 'savings';
  }

  onAccountSelected(account: FinancingAccountItem | null): void {
    this.selectedAccount = account;
    this.accountDetail = null;
    if (!account) return;
    this.loadAccountDetail(account.id);
  }

  onAddRequested(): void {
    forkJoin({
      types: this.catalogService.getFinancingTypes(),
      currencies: this.catalogService.getCurrencies(),
      entities: this.catalogService.getFinancingEntities(),
      walletGroups: this.catalogService.getWalletGroups(),
    }).subscribe({
      next: ({ types, currencies, entities, walletGroups }) => {
        const ref = this.dialog.open(AddAccountWizardComponent, {
          width: '680px',
          maxWidth: '95vw',
          disableClose: true,
          data: {
            financingTypes: types.data,
            currencies: currencies.data,
            entities: entities.data,
            walletGroups: walletGroups.data,
            accountService: this.accountService,
          },
        });

        ref.afterClosed().subscribe((result) => {
          if (result?.created) {
            this.listView.loadAccounts();
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  onDetailRefresh(): void {
    if (this.selectedAccount) {
      this.loadAccountDetail(this.selectedAccount.id);
    }
  }

  private loadAccountDetail(id: number): void {
    this.isLoadingDetail = true;
    this.accountService.getAccountById(id).subscribe({
      next: (response) => {
        this.accountDetail = response.data;
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
        this.isLoadingDetail = false;
      },
      complete: () => {
        this.isLoadingDetail = false;
      },
    });
  }
}
