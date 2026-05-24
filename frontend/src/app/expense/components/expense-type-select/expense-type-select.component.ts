import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { ExpenseTypeItem } from '@expense/types/expensesTypes';

@Component({
  selector: 'app-expense-type-select',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    LedgerIconComponent,
  ],
  templateUrl: './expense-type-select.component.html',
  styleUrl: './expense-type-select.component.scss',
})
export class ExpenseTypeSelectComponent implements OnInit {
  @Input() header = 'Type';
  @Input() items: ExpenseTypeItem[] = [];
  @Input() control: FormControl = new FormControl();
  @Input() isRequired = false;
  @Input() errMessage = 'Field is required.';

  filteredItems!: Observable<ExpenseTypeItem[]>;

  ngOnInit(): void {
    this.filteredItems = this.control.valueChanges.pipe(
      startWith(this.control.value),
      map((value) => this.filter(value))
    );
  }

  private filter(value: string | ExpenseTypeItem): ExpenseTypeItem[] {
    const q = typeof value === 'string'
      ? value.toLowerCase()
      : (value?.name ?? '').toLowerCase();
    return this.items.filter(item => item.name.toLowerCase().includes(q));
  }

  display(item: ExpenseTypeItem): string {
    return item?.name ?? '';
  }

  get selectedItem(): ExpenseTypeItem | null {
    const val = this.control.value;
    return val && typeof val !== 'string' ? val : null;
  }

  get isInvalid(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }
}
