import { Component, OnInit, ViewChild } from '@angular/core';
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
import { WalletFilterDialogComponent, WalletFilterDialogData, WalletGroupFilter, DEFAULT_WALLET_GROUP_FILTER } from '../../components/wallet-filter-dialog/wallet-filter-dialog.component';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { NotificationService } from '@common/services/notification.service';
import { WalletService } from '../../services/wallet.service';
import { WalletGroupItem } from '../../types/wallet.types';
import { CatalogItem } from '@common/types/catalogTypes';

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
  @ViewChild(CurrencyListComponent) currencyList!: CurrencyListComponent;

  groups: WalletGroupItem[] = [];
  availableCurrencies: CatalogItem[] = [];
  summary: WalletSummaryData = { groupCount: 0, walletCount: 0, currencyCount: 0 };
  isLoading = false;
  activeTab = 0;
  searchQuery = '';
  currentFilter: WalletGroupFilter = { ...DEFAULT_WALLET_GROUP_FILTER };

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get filteredGroups(): WalletGroupItem[] {
    let result = this.groups;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }

    if (this.currentFilter.status !== 'any') {
      const active = this.currentFilter.status === 'active' ? 1 : 0;
      result = result.filter(g => g.isActive === active);
    }

    if (this.currentFilter.currencies.length > 0) {
      const names = this.currentFilter.currencies.map(c => c.name.toLowerCase());
      result = result.filter(g =>
        g.currencies.some(c => names.includes(c.toLowerCase()))
      );
    }

    return result;
  }

  loadAll(): void {
    this.isLoading = true;
    forkJoin({
      groups: this.walletService.getWalletGroups(),
      currencies: this.walletService.getCurrencies(),
    }).subscribe({
      next: ({ groups, currencies }) => {
        this.groups = groups.data;
        this.availableCurrencies = currencies.data.map((c: any) => ({
          id: c.id,
          name: c.symbol,
        }));
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

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  onOpenFilter(): void {
    const dialogData: WalletFilterDialogData = {
      current: { ...this.currentFilter, currencies: [...this.currentFilter.currencies] },
      availableCurrencies: this.availableCurrencies,
    };

    const ref = this.dialog.open(WalletFilterDialogComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: dialogData,
    });

    ref.afterClosed().subscribe((result: WalletGroupFilter | null) => {
      if (result !== null && result !== undefined) {
        this.currentFilter = result;
      }
    });
  }

  onAddRequested(): void {
    if (this.activeTab === 1) {
      this.currencyList.openAdd();
      return;
    }
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
