import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { ExpenseTypeItem } from '@expense/types/expensesTypes';

@Component({
  selector: 'app-expense-type-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    FormsModule,
    LedgerIconComponent,
  ],
  templateUrl: './expense-type-multi-select.component.html',
  styleUrl: './expense-type-multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTypeMultiSelectComponent implements OnInit {
  @Input() header = '';
  @Input() placeholder = 'Add expense type...';
  @Input() items: ExpenseTypeItem[] = [];
  @Input() control: FormControl = new FormControl();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);

  current = model<string>();
  selectedNames = signal<string[]>([]);

  filtered = computed(() => {
    const selected = this.selectedNames().map(n => n.toLowerCase());
    const q = (this.current() ?? '').toLowerCase();
    return this.items.filter(item =>
      !selected.includes(item.name.toLowerCase()) &&
      item.name.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    const initial = (this.control.value as ExpenseTypeItem[]) ?? [];
    this.selectedNames.set(initial.map(i => i.name));
  }

  iconFor(name: string): string {
    return this.items.find(i => i.name === name)?.icon ?? 'label';
  }

  remove(name: string): void {
    this.selectedNames.update(names => {
      const idx = names.indexOf(name);
      if (idx < 0) return names;
      const next = [...names];
      next.splice(idx, 1);
      this.announcer.announce(`Removed ${name}`);
      this.syncControl(next);
      return next;
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as ExpenseTypeItem;
    this.selectedNames.update(names => {
      const next = [...names, item.name];
      this.syncControl(next);
      return next;
    });
    this.current.set('');
    event.option.deselect();
  }

  reset(): void {
    this.selectedNames.set([]);
    this.control.setValue([]);
  }

  private syncControl(names: string[]): void {
    this.control.setValue(this.items.filter(i => names.includes(i.name)));
  }
}
