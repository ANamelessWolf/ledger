import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { PageLayoutComponent } from 'app/shared/layouts/page-layout/page-layout.component';
import { WalletGroupTableComponent } from '../../components/wallet-group-table/wallet-group-table.component';
import { CurrencyListComponent } from '../../components/currency-list/currency-list.component';
import { WalletSummaryComponent, WalletSummaryData } from '../../components/wallet-summary/wallet-summary.component';
import { WalletGroupModalComponent, WalletGroupModalData } from '../../components/wallet-group-modal/wallet-group-modal.component';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { NotificationService } from '@common/services/notification.service';
import { WalletService } from '../../services/wallet.service';
import { WalletGroupItem } from '../../types/wallet.types';

@Component({
  selector: 'app-wallet-index-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    PageLayoutComponent,
    WalletGroupTableComponent,
    CurrencyListComponent,
    WalletSummaryComponent,
  ],
  templateUrl: './wallet-index-page.component.html',
  styleUrl: './wallet-index-page.component.scss',
  providers: [NotificationService],
})
export class WalletIndexPageComponent implements OnInit {
  groups: WalletGroupItem[] = [];
  summary: WalletSummaryData = { groupCount: 0, walletCount: 0, currencyCount: 0 };
  isLoading = false;

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    forkJoin({
      groups: this.walletService.getWalletGroups(),
      currencies: this.walletService.getCurrencies(),
    }).subscribe({
      next: ({ groups, currencies }) => {
        this.groups = groups.data;
        const walletCount = this.groups.reduce(
          (sum: number, g: WalletGroupItem) => sum + g.walletCount, 0
        );
        this.summary = {
          groupCount: this.groups.length,
          walletCount,
          currencyCount: currencies.data.length,
        };
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
      complete: () => (this.isLoading = false),
    });
  }

  onAddRequested(): void {
    this.walletService.getCurrencies().subscribe({
      next: (res: any) => {
        const modalData: WalletGroupModalData = { mode: 'add', currencies: res.data };

        const dialogData: DialogData = {
          header: 'New Wallet Group',
          component: WalletGroupModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: WalletGroupModalData) => (d.onValidate ? d.onValidate() : false),
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '560px',
          maxWidth: '95vw',
          disableClose: true,
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button === DialogButton.SAVE && modalData.result) {
            this.walletService
              .createWalletGroup({
                name: modalData.result.name,
                currencyIds: modalData.result.currencyIds ?? [],
              })
              .subscribe({
                next: () => this.loadAll(),
                error: (err: HttpErrorResponse) => this.notifService.showError(err),
              });
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }
}
