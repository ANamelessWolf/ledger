import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { NotificationService } from '@common/services/notification.service';
import { WalletService } from '../../services/wallet.service';
import { WalletGroupDetail, WalletMemberItem, WalletItem, CurrencyItem } from '../../types/wallet.types';
import {
  WalletGroupModalComponent,
  WalletGroupModalData,
} from '../wallet-group-modal/wallet-group-modal.component';
import {
  WalletMemberModalComponent,
  WalletMemberModalData,
} from '../wallet-member-modal/wallet-member-modal.component';

@Component({
  selector: 'app-wallet-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './wallet-group-detail.component.html',
  styleUrl: './wallet-group-detail.component.scss',
  providers: [NotificationService],
})
export class WalletGroupDetailComponent {
  @Input() detail!: WalletGroupDetail;
  @Output() refresh = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  displayedColumns = ['walletName', 'currency', 'forward', 'actions'];

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
    private notifService: NotificationService
  ) {}

  openEditGroup(): void {
    const modalData: WalletGroupModalData = {
      mode: 'edit',
      group: this.detail,
      currencies: [],
    };

    this.walletService.getCurrencies().subscribe({
      next: (res: any) => {
        modalData.currencies = res.data;

        const dialogData: DialogData = {
          header: 'Edit Wallet Group',
          component: WalletGroupModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: WalletGroupModalData) => (d.onValidate ? d.onValidate() : false),
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '520px',
          maxWidth: '95vw',
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button === DialogButton.SAVE && modalData.result) {
            this.walletService
              .updateWalletGroup(this.detail.id, { name: modalData.result.name })
              .subscribe({
                next: () => this.refresh.emit(),
                error: (err: HttpErrorResponse) => this.notifService.showError(err),
              });
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  openAddCurrency(): void {
    forkJoin({
      currencies: this.walletService.getCurrencies(),
      wallets: this.walletService.getAllWallets(),
    }).subscribe({
      next: ({ currencies, wallets }) => {
        const usedCurrencyIds = this.detail.members.map((m) => m.currencyId);
        const availableCurrencies: CurrencyItem[] = (currencies.data as CurrencyItem[]).filter(
          (c) => !usedCurrencyIds.includes(c.id)
        );

        const modalData: WalletMemberModalData = {
          mode: 'add',
          currencies: availableCurrencies,
          allWallets: wallets.data,
        };

        const dialogData: DialogData = {
          header: 'Add Currency to Group',
          component: WalletMemberModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: WalletMemberModalData) => (d.onValidate ? d.onValidate() : false),
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '480px',
          maxWidth: '95vw',
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button === DialogButton.SAVE && modalData.result?.currencyId != null) {
            this.walletService
              .addCurrencyToGroup(this.detail.id, {
                currencyId: modalData.result.currencyId,
                forwardWalletId: modalData.result.forwardWalletId,
              })
              .subscribe({
                next: () => this.refresh.emit(),
                error: (err: HttpErrorResponse) => this.notifService.showError(err),
              });
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  openEditMember(member: WalletMemberItem): void {
    this.walletService.getAllWallets().subscribe({
      next: (res: any) => {
        const modalData: WalletMemberModalData = {
          mode: 'edit',
          member,
          currencies: [],
          allWallets: res.data,
        };

        const dialogData: DialogData = {
          header: 'Edit Forward Wallet',
          component: WalletMemberModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: WalletMemberModalData) => (d.onValidate ? d.onValidate() : false),
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '480px',
          maxWidth: '95vw',
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button === DialogButton.SAVE && modalData.result) {
            this.walletService
              .updateMember(member.memberId, { forwardWalletId: modalData.result.forwardWalletId ?? null })
              .subscribe({
                next: () => this.refresh.emit(),
                error: (err: HttpErrorResponse) => this.notifService.showError(err),
              });
          }
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  removeMember(member: WalletMemberItem): void {
    this.walletService.removeCurrencyFromGroup(member.memberId).subscribe({
      next: () => this.refresh.emit(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  deleteGroup(): void {
    this.walletService.deleteWalletGroup(this.detail.id).subscribe({
      next: () => this.deleted.emit(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }
}
