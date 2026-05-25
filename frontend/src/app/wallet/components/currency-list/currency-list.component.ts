import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogWrapperComponent } from '@common/components/dialog-wrapper/dialog-wrapper.component';
import { DialogData } from '@common/types/DialogData';
import { DialogButton } from '@config/enums';
import { SpinnerComponent } from '@common/components/spinner/spinner.component';
import { NotificationService } from '@common/services/notification.service';
import { WalletService } from '../../services/wallet.service';
import { CurrencyItem } from '../../types/wallet.types';
import { CurrencyModalComponent, CurrencyModalData } from '../currency-modal/currency-modal.component';

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    SpinnerComponent,
  ],
  templateUrl: './currency-list.component.html',
  styleUrl: './currency-list.component.scss',
  providers: [NotificationService],
})
export class CurrencyListComponent implements OnInit {
  isLoading = true;
  currencies: CurrencyItem[] = [];
  displayedColumns = ['name', 'symbol', 'conversion', 'actions'];

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.isLoading = true;
    this.walletService.getCurrencies().subscribe({
      next: (res: any) => {
        this.currencies = res.data;
      },
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  openAdd(): void {
    const modalData: CurrencyModalData = { mode: 'add' };

    const dialogData: DialogData = {
      header: 'Add Currency',
      component: CurrencyModalComponent,
      data: modalData,
      validationData: modalData,
      buttons: [DialogButton.SAVE, DialogButton.CANCEL],
      validate: (d: CurrencyModalData) => (d.onValidate ? d.onValidate() : false),
    };

    const ref = this.dialog.open(DialogWrapperComponent, {
      width: '420px',
      maxWidth: '95vw',
      data: dialogData,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result?.button === DialogButton.SAVE && modalData.result) {
        this.walletService.createCurrency(modalData.result).subscribe({
          next: () => this.loadCurrencies(),
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      }
    });
  }

  openEdit(currency: CurrencyItem): void {
    const modalData: CurrencyModalData = { mode: 'edit', currency };

    const dialogData: DialogData = {
      header: 'Edit Currency',
      component: CurrencyModalComponent,
      data: modalData,
      validationData: modalData,
      buttons: [DialogButton.SAVE, DialogButton.CANCEL],
      validate: (d: CurrencyModalData) => (d.onValidate ? d.onValidate() : false),
    };

    const ref = this.dialog.open(DialogWrapperComponent, {
      width: '420px',
      maxWidth: '95vw',
      data: dialogData,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result?.button === DialogButton.SAVE && modalData.result) {
        this.walletService.updateCurrency(currency.id, modalData.result).subscribe({
          next: () => this.loadCurrencies(),
          error: (err: HttpErrorResponse) => this.notifService.showError(err),
        });
      }
    });
  }

  deleteCurrency(currency: CurrencyItem): void {
    this.walletService.deleteCurrency(currency.id).subscribe({
      next: () => this.loadCurrencies(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }

  setDefault(currency: CurrencyItem): void {
    this.walletService.setDefaultCurrency(currency.id).subscribe({
      next: () => this.loadCurrencies(),
      error: (err: HttpErrorResponse) => this.notifService.showError(err),
    });
  }
}
