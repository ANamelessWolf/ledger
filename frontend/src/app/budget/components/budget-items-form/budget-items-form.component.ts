import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BudgetItemDetail, BudgetItemsFormData } from '@budget/types/budgetTypes';
import { CatalogItem } from '@common/types/catalogTypes';

@Component({
  selector: 'app-budget-items-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './budget-items-form.component.html',
  styleUrl: './budget-items-form.component.scss',
})
export class BudgetItemsFormComponent {
  selectedExpenseTypeId: number | null = null;
  selectedVendorId: number | null = null;

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

  addExpenseType() {
    if (!this.selectedExpenseTypeId) return;
    const alreadyAdded = this.expenseTypeItems.some((i) => i.itemId === this.selectedExpenseTypeId);
    if (alreadyAdded) return;
    this.data.onItemAdded({ itemType: 1, itemId: this.selectedExpenseTypeId });
    this.selectedExpenseTypeId = null;
  }

  addVendor() {
    if (!this.selectedVendorId) return;
    const alreadyAdded = this.vendorItems.some((i) => i.itemId === this.selectedVendorId);
    if (alreadyAdded) return;
    this.data.onItemAdded({ itemType: 2, itemId: this.selectedVendorId });
    this.selectedVendorId = null;
  }

  removeItem(item: BudgetItemDetail) {
    this.data.onItemRemoved(item.id);
  }

  getExpenseTypeName(itemId: number): string {
    return this.data.expenseTypes.find((e) => e.id === itemId)?.name ?? `ID ${itemId}`;
  }

  getVendorName(itemId: number): string {
    return this.data.vendors.find((v) => v.id === itemId)?.name ?? `ID ${itemId}`;
  }

  close() {
    this.dialogRef.close();
  }
}
