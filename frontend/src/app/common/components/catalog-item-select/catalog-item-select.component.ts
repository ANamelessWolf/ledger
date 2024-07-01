import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { CatalogItem } from '@common/types/catalogTypes';

@Component({
  selector: 'app-catalog-item-select',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './catalog-item-select.component.html',
  styleUrl: './catalog-item-select.component.scss',
})
export class CatalogItemSelectComponent implements OnInit {
  @Input() header: string = '';
  @Input() items: CatalogItem[] = [];
  @Input() control: FormControl = new FormControl();
  filteredItems!: Observable<CatalogItem[]>;

  ngOnInit(): void {
    this.filteredItems = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string | CatalogItem): CatalogItem[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && value.name) {
      filterValue = value.name.toLowerCase();
    }
    return this.items.filter((item: CatalogItem) =>
      item.name.toLowerCase().includes(filterValue)
    );
  }

  display(item: CatalogItem): string {
    return item && item.name ? item.name : '';
  }
}
