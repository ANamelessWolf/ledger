import { Component, EventEmitter, Input, OnChanges, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { NotificationService } from '@common/services/notification.service';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';
import { WalletService } from '../../services/wallet.service';
import { CurrencyItem, WalletGroupItem } from '../../types/wallet.types';
import { WalletGroupModalComponent, WalletGroupModalData } from '../wallet-group-modal/wallet-group-modal.component';
import {
  WalletCurrenciesModalComponent,
  WalletCurrenciesModalData,
} from '../wallet-currencies-modal/wallet-currencies-modal.component';

@Component({
  selector: 'app-wallet-group-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule,
    MatSlideToggleModule,
  ],
  templateUrl: './wallet-group-table.component.html',
  styleUrl: './wallet-group-table.component.scss',
  providers: [NotificationService],
})
export class WalletGroupTableComponent implements OnChanges, AfterViewInit {
  @Input() groups: WalletGroupItem[] = [];
  @Output() refresh = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;

  columns = ['name', 'currencies', 'active', 'actions'];
  dataSource = new MatTableDataSource<WalletGroupItem>();

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private notifService: NotificationService
  ) {}

  ngOnChanges(): void {
    this.dataSource.data = this.groups;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sort({ id: 'name', start: 'asc', disableClear: false });
  }

  openEditGroup(group: WalletGroupItem): void {
    forkJoin({
      detail: this.walletService.getWalletGroupById(group.id),
      wallets: this.walletService.getAllWallets(),
    }).subscribe({
      next: ({ detail, wallets }) => {
        const modalData: WalletGroupModalData = {
          mode: 'edit',
          currencies: [],
          group: { id: detail.data.id, name: detail.data.name, members: detail.data.members },
          availableWallets: wallets.data,
        };

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
          if (result?.button !== DialogButton.SAVE || !modalData.result) return;

          const { name, memberUpdates } = modalData.result;
          const calls: any[] = [];

          if (name !== group.name) {
            calls.push(this.walletService.updateWalletGroup(group.id, { name }));
          }

          if (memberUpdates?.length) {
            for (const u of memberUpdates) {
              calls.push(this.walletService.updateMember(u.memberId, { forwardWalletId: u.forwardWalletId }));
            }
          }

          if (calls.length === 0) return;

          forkJoin(calls).subscribe({
            next: () => this.refresh.emit(),
            error: (err: HttpErrorResponse) => this.notifService.showError(err),
          });
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  openManageCurrencies(group: WalletGroupItem): void {
    forkJoin({
      detail: this.walletService.getWalletGroupById(group.id),
      currencies: this.walletService.getCurrencies(),
    }).subscribe({
      next: ({ detail, currencies }) => {
        const addedMembers = detail.data.members;
        const addedCurrencyIds: number[] = addedMembers.map((m: any) => m.currencyId);
        const available: CurrencyItem[] = (currencies.data as CurrencyItem[]).filter(
          (c) => !addedCurrencyIds.includes(c.id)
        );

        const modalData: WalletCurrenciesModalData = { addedMembers, availableCurrencies: available };

        const dialogData: DialogData = {
          header: `Currencies — ${group.name}`,
          component: WalletCurrenciesModalComponent,
          data: modalData,
          validationData: modalData,
          buttons: [DialogButton.SAVE, DialogButton.CANCEL],
          validate: (d: WalletCurrenciesModalData) => (d.onValidate ? d.onValidate() : false),
        };

        const ref = this.dialog.open(DialogWrapperComponent, {
          width: '640px',
          maxWidth: '95vw',
          data: dialogData,
        });

        ref.afterClosed().subscribe((result: any) => {
          if (result?.button !== DialogButton.SAVE || !modalData.result) return;

          const { toAdd, toRemove } = modalData.result;
          if (toAdd.length === 0 && toRemove.length === 0) return;

          const addCalls = toAdd.map((c) =>
            this.walletService.addCurrencyToGroup(group.id, { currencyId: c.id, forwardWalletId: null })
          );
          const removeCalls = toRemove.map((m) =>
            this.walletService.removeCurrencyFromGroup(m.memberId)
          );

          const allCalls = [...addCalls, ...removeCalls];
          if (allCalls.length === 0) return;

          forkJoin(allCalls).subscribe({
            next: () => this.refresh.emit(),
            error: (err: HttpErrorResponse) => {
              this.notifService.showError(err);
              this.refresh.emit();
            },
          });
        });
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  toggleActive(group: WalletGroupItem): void {
    this.walletService.toggleWalletGroupActive(group.id).subscribe({
      next: () => this.refresh.emit(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  deleteGroup(group: WalletGroupItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Wallet',
        message: `Delete "${group.name}"? This will also remove all associated wallets.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.walletService.deleteWalletGroup(group.id).subscribe({
        next: () => this.refresh.emit(),
        error: (err: HttpErrorResponse) => this.notifService.showError(err),
      });
    });
  }
}
