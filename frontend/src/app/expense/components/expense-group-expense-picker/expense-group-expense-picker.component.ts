import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { CatalogItem } from '@common/types/catalogTypes';
import { EMPTY_PAGINATION } from '@config/commonTypes';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { ExpensesService } from '@expense/services/expenses.service';
import { Expense } from '@expense/types/expensesTypes';
import { mapExpense } from '@expense/utils/expenseUtils';

@Component({
  selector: 'app-expense-group-expense-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LedgerIconComponent,
    CurrencyFormatPipe,
  ],
  providers: [ExpensesService, provideNativeDateAdapter()],
  templateUrl: './expense-group-expense-picker.component.html',
  styleUrl: './expense-group-expense-picker.component.scss',
})
export class ExpenseGroupExpensePickerComponent implements OnInit {
  @Input() wallets: CatalogItem[] = [];
  @Input() set excludeIds(ids: number[]) {
    this._excludeIds = new Set(ids);
    this.applyExclusion();
  }
  @Output() selectionChange = new EventEmitter<Expense[]>();

  private _excludeIds = new Set<number>();

  filterForm = new FormGroup({
    description: new FormControl(''),
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    wallets: new FormControl<number[]>([]),
  });

  results: Expense[] = [];
  selected = new Map<number, Expense>();
  isLoading = false;
  hasSearched = false;

  displayedColumns = ['select', 'expense', 'total', 'date'];

  constructor(private expensesService: ExpensesService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const { description, start, end, wallets } = this.filterForm.value;
    this.isLoading = true;
    this.expensesService.getExpenses({
      pagination: { ...EMPTY_PAGINATION, pageSize: 200 },
      filter: {
        description: description || undefined,
        period: start && end ? { start: start!, end: end! } : undefined,
        wallet: wallets?.length ? wallets : undefined,
      },
    }).subscribe({
      next: (res) => {
        const { expenses } = mapExpense(res);
        this.results = expenses.filter(e => !this._excludeIds.has(e.id));
        this.hasSearched = true;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  toggle(expense: Expense): void {
    if (this.selected.has(expense.id)) {
      this.selected.delete(expense.id);
    } else {
      this.selected.set(expense.id, expense);
    }
    this.selectionChange.emit([...this.selected.values()]);
  }

  isSelected(id: number): boolean {
    return this.selected.has(id);
  }

  get selectedCount(): number {
    return this.selected.size;
  }

  get selectedExpenses(): Expense[] {
    return [...this.selected.values()];
  }

  clearSelection(): void {
    this.selected.clear();
    this.selectionChange.emit([]);
  }

  private applyExclusion(): void {
    this.results = this.results.filter(e => !this._excludeIds.has(e.id));
    for (const id of this._excludeIds) {
      this.selected.delete(id);
    }
    this.selectionChange.emit([...this.selected.values()]);
  }
}
