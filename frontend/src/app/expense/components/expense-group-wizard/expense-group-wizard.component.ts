import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { CatalogService } from '@common/services/catalog.service';
import { NotificationService } from '@common/services/notification.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { ExpenseGroupExpensePickerComponent } from '@expense/components/expense-group-expense-picker/expense-group-expense-picker.component';
import { ExpenseGroupsService } from '@expense/services/expense-groups.service';
import { ExpenseGroup } from '@expense/types/expenseGroupTypes';
import { Expense } from '@expense/types/expensesTypes';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { IconSelectComponent } from '@common/components/icon-select/icon-select.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-expense-group-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    IconSelectComponent,
    ExpenseGroupExpensePickerComponent,
    LedgerIconComponent,
  ],
  providers: [CatalogService, NotificationService],
  templateUrl: './expense-group-wizard.component.html',
  styleUrl: './expense-group-wizard.component.scss',
})
export class ExpenseGroupWizardComponent implements OnInit {
  @ViewChild('picker') picker!: ExpenseGroupExpensePickerComponent;

  infoForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(''),
    icon: new FormControl('group_work'),
  });

  wallets: CatalogItem[] = [];
  selectedExpenses: Expense[] = [];
  isSaving = false;

  get iconControl(): FormControl {
    return this.infoForm.get('icon') as FormControl;
  }

  get currentIcon(): string {
    return this.infoForm.get('icon')?.value ?? '';
  }

  constructor(
    private dialogRef: MatDialogRef<ExpenseGroupWizardComponent>,
    private groupsService: ExpenseGroupsService,
    private catalogService: CatalogService,
    private notifService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.catalogService.getWallets().subscribe({
      next: (res) => { this.wallets = res.data ?? []; },
    });
  }

  onSelectionChange(expenses: Expense[]): void {
    this.selectedExpenses = expenses;
  }

  finish(): void {
    if (this.infoForm.invalid || this.isSaving) return;
    this.isSaving = true;

    const { name, description, icon } = this.infoForm.value;
    this.groupsService.createGroup({ name: name!, description, icon }).subscribe({
      next: (res) => {
        const group: ExpenseGroup = res.data;
        if (this.selectedExpenses.length === 0) {
          this.notifService.showNotification('Group created', 'success');
          this.dialogRef.close(group);
          return;
        }
        const adds = this.selectedExpenses.map(e =>
          this.groupsService.addExpenseToGroup(group.id, e.id)
        );
        forkJoin(adds).subscribe({
          next: () => {
            this.notifService.showNotification('Group created', 'success');
            this.dialogRef.close(group);
          },
          error: (err: HttpErrorResponse) => {
            this.notifService.showError(err);
            this.isSaving = false;
            this.dialogRef.close(group);
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.notifService.showError(err);
        this.isSaving = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
