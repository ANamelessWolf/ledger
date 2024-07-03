import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { PaginationEvent } from '@config/commonTypes';

@Component({
  selector: 'app-expense-table',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    LedgerIconComponent
  ],
  templateUrl: './expense-table.component.html',
  styleUrl: './expense-table.component.scss'
})
export class ExpenseTableComponent {
  @Input() expenses: any[] = [];
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<PaginationEvent>();

  displayedColumns: string[] = ['id', 'wallet', 'expense', 'total', 'buyDate'];
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;

  pageChanged(event: PaginationEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex, pageSize });
  }
}
