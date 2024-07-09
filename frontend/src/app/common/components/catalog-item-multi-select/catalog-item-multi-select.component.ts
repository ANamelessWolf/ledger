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
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CatalogItem } from '@common/types/catalogTypes';

@Component({
  selector: 'app-catalog-item-multi-select',
  templateUrl: './catalog-item-multi-select.component.html',
  styleUrl: './catalog-item-multi-select.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogItemMultiSelectComponent implements OnInit {
  @Input() header: string = '';
  @Input() placeholder: string = 'Pick an item...';
  @Input() items: CatalogItem[] = [];
  @Input() control: FormControl = new FormControl();
  @Input() isRequired: boolean = false;
  @Input() errMessage: string = 'Field is required.';

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  current = model<string>();
  selectedItems = signal<string[]>([]);
  allItems: string[] = [];

  filtered = computed(() => {
    const selected = this.selectedItems().map((x) => x.toLowerCase());
    let current: string = this.current() || '';
    current = current.toLowerCase();
    const items = this.allItems.filter((x) =>
      x.toLowerCase().includes(current)
    );
    if (selected.length > 0) {
      return items.filter((x) => !selected.includes(x.toLowerCase()));
    } else {
      return items;
    }
  });

  ngOnInit(): void {
    this.allItems = this.items.map((x) => x.name);
    const values = (this.control.value as CatalogItem[]).map((x) => x.name);
    this.selectedItems.update((items) => [...values]);
  }

  readonly announcer = inject(LiveAnnouncer);

  remove(item: string): void {
    this.selectedItems.update((items) => {
      const index = items.indexOf(item);
      if (index < 0) {
        return items;
      }

      items.splice(index, 1);
      this.announcer.announce(`Removed ${items}`);
      return [...items];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedItems.update((items) => [...items, event.option.viewValue]);
    const names = this.selectedItems();
    this.control.setValue(this.items.filter((x) => names.includes(x.name)));
    this.current.update((items) => '');
    event.option.deselect();
  }

  reset(): void {
    this.selectedItems.update(() => []);
    this.control.setValue([]);
  }

  get isInvalid() {
    return this.selectedItems().length === 0;
  }
}
