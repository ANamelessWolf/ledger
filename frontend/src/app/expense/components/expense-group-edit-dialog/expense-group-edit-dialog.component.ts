import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { IconSelectComponent } from '@common/components/icon-select/icon-select.component';
import { ExpenseGroupExpensePickerComponent } from '@expense/components/expense-group-expense-picker/expense-group-expense-picker.component';
import { ExpenseGroupsService } from '@expense/services/expense-groups.service';
import { ExpenseGroup } from '@expense/types/expenseGroupTypes';
import { Expense } from '@expense/types/expensesTypes';
import { forkJoin } from 'rxjs';

export type EditGroupDialogData = {
  group: ExpenseGroup;
};

@Component({
  selector: 'app-expense-group-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LedgerIconComponent,
    IconSelectComponent,
    ExpenseGroupExpensePickerComponent,
    CurrencyFormatPipe,
  ],
  providers: [CatalogService, NotificationService],
  templateUrl: './expense-group-edit-dialog.component.html',
  styleUrl: './expense-group-edit-dialog.component.scss',
})
export class ExpenseGroupEditDialogComponent implements OnInit {
  @ViewChild('picker') picker!: ExpenseGroupExpensePickerComponent;

  infoForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(''),
    icon: new FormControl(''),
  });

  wallets: CatalogItem[] = [];
  groupExpenses: Expense[] = [];
  expensesToAdd: Expense[] = [];
  isLoadingExpenses = false;
  isSavingInfo = false;
  updated = false;

  get iconControl(): FormControl {
    return this.infoForm.get('icon') as FormControl;
  }

  get currentIcon(): string {
    return this.infoForm.get('icon')?.value ?? '';
  }

  get currentExpenseIds(): number[] {
    return this.groupExpenses.map(e => e.id);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditGroupDialogData,
    private dialogRef: MatDialogRef<ExpenseGroupEditDialogComponent>,
    private groupsService: ExpenseGroupsService,
    private catalogService: CatalogService,
    private notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    const { name, description, icon } = this.data.group;
    this.infoForm.patchValue({ name, description: description ?? '', icon: icon ?? '' });

    this.catalogService.getWallets().subscribe({ next: (res) => { this.wallets = res.data ?? []; } });
    this.loadGroupExpenses();
  }

  loadGroupExpenses(): void {
    this.isLoadingExpenses = true;
    this.groupsService.getGroupExpenses(this.data.group.id).subscribe({
      next: (res) => {
        this.groupExpenses = res.data ?? [];
        this.isLoadingExpenses = false;
      },
      error: () => { this.isLoadingExpenses = false; },
    });
  }

  saveInfo(): void {
    if (this.infoForm.invalid || this.isSavingInfo) return;
    this.isSavingInfo = true;
    const { name, description, icon } = this.infoForm.value;
    this.groupsService.updateGroup(this.data.group.id, { name: name!, description, icon }).subscribe({
      next: () => {
        this.notifService.showNotification('Group updated', 'success');
        this.updated = true;
        this.isSavingInfo = false;
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
        this.isSavingInfo = false;
      },
    });
  }

  removeExpense(expense: Expense): void {
    this.groupsService.removeExpenseFromGroup(this.data.group.id, expense.id).subscribe({
      next: () => {
        this.groupExpenses = this.groupExpenses.filter(e => e.id !== expense.id);
        this.updated = true;
        this.notifService.showNotification('Expense removed from group', 'success');
      },
      error: (err: HttpErrorResponse) => { this.notifService.showError(err); },
    });
  }

  onPickerSelectionChange(expenses: Expense[]): void {
    this.expensesToAdd = expenses;
  }

  addSelected(): void {
    if (this.expensesToAdd.length === 0) return;
    const adds = this.expensesToAdd.map(e =>
      this.groupsService.addExpenseToGroup(this.data.group.id, e.id)
    );
    forkJoin(adds).subscribe({
      next: () => {
        this.notifService.showNotification(`${this.expensesToAdd.length} expense(s) added`, 'success');
        this.updated = true;
        this.picker.clearSelection();
        this.loadGroupExpenses();
      },
      error: (err: HttpErrorResponse) => { this.notifService.showError(err); },
    });
  }

  close(): void {
    this.dialogRef.close({ updated: this.updated });
  }
}
