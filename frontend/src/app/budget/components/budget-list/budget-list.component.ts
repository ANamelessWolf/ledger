import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Budget, BudgetItemDetail } from '@budget/types/budgetTypes';
import { CatalogItem } from '@common/types/catalogTypes';

@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './budget-list.component.html',
  styleUrl: './budget-list.component.scss',
})
export class BudgetListComponent {
  @Input() budgets: Budget[] = [];
  @Input() selectedBudget: Budget | null = null;
  @Input() budgetItems: BudgetItemDetail[] = [];
  @Input() expenseTypes: CatalogItem[] = [];
  @Input() vendors: CatalogItem[] = [];

  @Output() budgetSelected = new EventEmitter<Budget>();
  @Output() editBudget = new EventEmitter<Budget>();
  @Output() deleteBudget = new EventEmitter<Budget>();
  @Output() manageItems = new EventEmitter<Budget>();

  isSelected(budget: Budget): boolean {
    return this.selectedBudget?.id === budget.id;
  }

  select(budget: Budget) {
    this.budgetSelected.emit(budget);
  }

  edit(event: Event, budget: Budget) {
    event.stopPropagation();
    this.editBudget.emit(budget);
  }

  delete(event: Event, budget: Budget) {
    event.stopPropagation();
    this.deleteBudget.emit(budget);
  }

  manageItemsFor(event: Event, budget: Budget) {
    event.stopPropagation();
    this.manageItems.emit(budget);
  }

  get selectedExpenseTypeItems(): CatalogItem[] {
    return this.budgetItems
      .filter((i) => i.itemType === 1)
      .map((i) => this.expenseTypes.find((et) => et.id === i.itemId))
      .filter((et): et is CatalogItem => !!et);
  }

  get selectedVendorItems(): CatalogItem[] {
    return this.budgetItems
      .filter((i) => i.itemType === 2)
      .map((i) => this.vendors.find((v) => v.id === i.itemId))
      .filter((v): v is CatalogItem => !!v);
  }

  get hasItems(): boolean {
    return this.budgetItems.length > 0;
  }
}
