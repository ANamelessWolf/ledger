import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchBarComponent } from '@common/components/search-bar/search-bar.component';
import { MATERIAL_COMPONENTS } from 'app/shared/material/material.module';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
     CommonModule,
     SearchBarComponent,
     ...MATERIAL_COMPONENTS],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent {
  @Input() title: string = 'Section Title';
  @Input() hasFilter: boolean = false;
  @Input() hasWidget: boolean = false;

  @Output() onSearch = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() openFilter = new EventEmitter<void>();

  handleSearch(query: string) {
    this.onSearch.emit(query);
  }

  handleAdd() {
    this.add.emit();
  }

  handleOpenFilter() {
    this.openFilter.emit();
  }
}
