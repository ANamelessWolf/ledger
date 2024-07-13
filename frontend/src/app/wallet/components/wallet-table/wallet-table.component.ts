import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { NotificationService } from '@common/services/notification.service';
import { PaginationEvent } from '@config/commonTypes';
import { WalletService } from '@wallet/services/wallet.service';
import { EMPTY_WALLET_OPTIONS, Wallet, WalletOptions, WalletRequest } from '@wallet/types/walletTypes';

@Component({
  selector: 'app-wallet-table',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    LedgerIconComponent,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './wallet-table.component.html',
  styleUrl: './wallet-table.component.scss'
})
export class WalletTableComponent {

  @Input() header: string = '';
  @Input() expenses: Wallet[] = [];
  @Input() totalItems: number = 0;
  @Input() catalog: WalletOptions = EMPTY_WALLET_OPTIONS;
  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() walletEdited = new EventEmitter<number>();

  displayedColumns: string[] = [
    'id',
    'wallet',
    'expense',
    'total',
    'buyDate',
    'actions',
  ];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;

  public constructor(
    private walletService: WalletService,
    private notifService: NotificationService
  ) {}

  pageChanged(event: PaginationEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex, pageSize });
  }

  sortChanged(event: Sort) {
    this.sortChange.emit(event);
  }

  editExpense(id: number, wallet: Wallet) {
    // const expUpd: UpdateExpense = {
    //   id,
    //   walletId: expense.walletId,
    //   expenseTypeId: expense.expenseTypeId,
    //   vendorId: expense.vendorId,
    //   total: expense.value,
    //   buyDate: expense.buyDate,
    //   description: expense.description,
    // };
    // this.expenseService
    //   .showEditExpenseDialog(
    //     'Update expense',
    //     expUpd,
    //     this.catalog,
    //     this.expenseUpdated.bind(this)
    //   )
    //   .subscribe();
  }

  walletUpdated(request: WalletRequest) {
    // console.log(request);
    // this.expenseService.editExpense(request.id, request.body).subscribe(
    //   (response) => {
    //     this.notifService.showNotification(
    //       'Expense updated succesfully',
    //       'success'
    //     );
    //     this.expenseEdited.emit(request.id);
    //   },
    //   (err: HttpErrorResponse) => {
    //     this.notifService.showError(err);
    //   },
    //   //Complete
    //   () => {}
    // );
  }

}
