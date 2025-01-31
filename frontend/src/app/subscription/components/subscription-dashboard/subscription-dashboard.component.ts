import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PaginationEvent } from '@config/commonTypes';

@Component({
  selector: 'app-subscription-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatSlideToggleModule,
  ],
  templateUrl: './subscription-dashboard.component.html',
  styleUrl: './subscription-dashboard.component.scss',
})
/**
 * Component representing the subscription dashboard.
 *
 */
export class SubscriptionDashboardComponent {
  @Input() header: string = '';
  @Input() totalItems: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() pageSize: number = 10;

  @Output() pageChange = new EventEmitter<PaginationEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  displayedColumns: string[] = [
    'id',
    'currency',
    'wallet',
    'frequency',
    'description',
    'price',
    'chargeDate',
    'isActive',
    'actions',
  ];

  dataSource = [
    {
      id: 1,
      currency: 'USD',
      wallet: 'Main Wallet',
      frequency: 'Monthly',
      description: 'Netflix Subscription',
      price: 12.99,
      chargeDate: new Date(),
      isActive: true,
    },
    {
      id: 2,
      currency: 'EUR',
      wallet: 'Savings Wallet',
      frequency: 'Yearly',
      description: 'Spotify Premium',
      price: 99.99,
      chargeDate: new Date(),
      isActive: false,
    },
  ];

  editExpense(id: number, row: any): void {
    console.log('Edit expense:', id, row);
  }

  /**
   * Action triggered when the "Is Active" switch is toggled.
   * @param id - The ID of the subscription.
   * @param isActive - The new status (true for Active, false for Inactive).
   */
  toggleActive(id: number, isActive: boolean): void {
    console.log(
      `Subscription ID: ${id}, New Status: ${isActive ? 'Active' : 'Inactive'}`
    );
    // Aquí puedes realizar acciones como una llamada al backend para actualizar el estado.
  }

  /**
   * Handles the page change event from the pagination component.
   *
   * @param event - The pagination event containing the new page index and page size.
   * @fires pageChange - Emits an event with the updated page index and page size.
   */
  pageChanged(event: PaginationEvent) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageChange.emit({ pageIndex, pageSize });
  }

  /**
   * Handles the change event for sorting.
   *
   * @param event - The sorting event containing the new sort state.
   */
  sortChanged(event: Sort) {
    this.sortChange.emit(event);
  }
}
