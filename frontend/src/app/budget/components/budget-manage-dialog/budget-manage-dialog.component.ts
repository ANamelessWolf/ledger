import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Budget, BudgetItemDetail, BudgetManageDialogData } from '@budget/types/budgetTypes';
import { BudgetListComponent } from '@budget/components/budget-list/budget-list.component';
import { ConfirmDialogComponent } from 'app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-budget-manage-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, BudgetListComponent],
  templateUrl: './budget-manage-dialog.component.html',
  styleUrl: './budget-manage-dialog.component.scss',
})
export class BudgetManageDialogComponent implements OnInit {
  budgets: Budget[] = [];
  selectedBudget: Budget | null = null;
  budgetItems: BudgetItemDetail[] = [];
  dirty = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BudgetManageDialogData,
    private dialogRef: MatDialogRef<BudgetManageDialogComponent>,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.budgets = [...this.data.budgets];
  }

  onBudgetSelected(budget: Budget): void {
    this.selectedBudget = budget;
    this.data.onBudgetSelected(budget, (items) => (this.budgetItems = items));
  }

  onEditBudget(budget: Budget): void {
    this.data.onEditBudget(budget, (updatedBudgets) => {
      this.budgets = updatedBudgets;
      this.dirty = true;
    });
  }

  onDeleteBudget(budget: Budget): void {
    const ref = this.matDialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete budget',
        message: `Are you sure you want to delete "${budget.description}"?`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.data.onDeleteBudget(budget, (updatedBudgets) => {
        this.budgets = updatedBudgets;
        this.dirty = true;
        if (this.selectedBudget?.id === budget.id) {
          this.selectedBudget = null;
          this.budgetItems = [];
        }
      });
    });
  }

  onManageItems(budget: Budget): void {
    this.data.onManageItems(budget, this.budgetItems, (updatedItems) => {
      this.budgetItems.splice(0, this.budgetItems.length, ...updatedItems);
      this.dirty = true;
    });
  }

  close(): void {
    this.dialogRef.close(this.dirty);
  }
}
