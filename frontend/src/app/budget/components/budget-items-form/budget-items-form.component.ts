import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BudgetItemDetail, BudgetItemsFormData } from '@budget/types/budgetTypes';
import { CatalogItem } from '@common/types/catalogTypes';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';

@Component({
  selector: 'app-budget-items-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatTooltipModule,
    CatalogItemSelectComponent,
  ],
  templateUrl: './budget-items-form.component.html',
  styleUrl: './budget-items-form.component.scss',
})
export class BudgetItemsFormComponent {
  expenseTypeControl = new FormControl<CatalogItem | null>(null);
  vendorControl = new FormControl<CatalogItem | null>(null);

  get expenseTypeItems(): BudgetItemDetail[] {
    return this.data.currentItems.filter((i) => i.itemType === 1);
  }

  get vendorItems(): BudgetItemDetail[] {
    return this.data.currentItems.filter((i) => i.itemType === 2);
  }

  constructor(
    private dialogRef: MatDialogRef<BudgetItemsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BudgetItemsFormData
  ) {}

  addExpenseType(): void {
    const item = this.expenseTypeControl.value;
    if (!item) return;
    const alreadyAdded = this.expenseTypeItems.some((i) => i.itemId === item.id);
    if (alreadyAdded) return;
    this.data.onItemAdded({ itemType: 1, itemId: item.id });
    this.expenseTypeControl.reset();
  }

  addVendor(): void {
    const item = this.vendorControl.value;
    if (!item) return;
    const alreadyAdded = this.vendorItems.some((i) => i.itemId === item.id);
    if (alreadyAdded) return;
    this.data.onItemAdded({ itemType: 2, itemId: item.id });
    this.vendorControl.reset();
  }

  removeItem(item: BudgetItemDetail): void {
    this.data.onItemRemoved(item.id);
  }

  getExpenseTypeName(itemId: number): string {
    return this.data.expenseTypes.find((e) => e.id === itemId)?.name ?? `ID ${itemId}`;
  }

  getVendorName(itemId: number): string {
    return this.data.vendors.find((v) => v.id === itemId)?.name ?? `ID ${itemId}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}
