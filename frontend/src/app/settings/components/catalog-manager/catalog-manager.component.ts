import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { NotificationService } from '@common/services/notification.service';
import { SettingsService } from '../../services/settings.service';
import { CatalogConfig } from '../../types/catalog-config.types';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-catalog-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    LedgerIconComponent,
    IconPickerComponent,
  ],
  templateUrl: './catalog-manager.component.html',
  styleUrl: './catalog-manager.component.scss',
  providers: [NotificationService],
})
export class CatalogManagerComponent implements OnInit, OnChanges {
  @Input() config!: CatalogConfig;

  @ViewChild(MatSort) set sort(s: MatSort) { if (s) this.dataSource.sort = s; }
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  isLoading = false;
  selectOptions: Record<string, any[]> = {};

  // Inline editing
  editingRow: any | null = null;
  editingNew = false;
  editingForm!: FormGroup;
  editingIconValue = '';
  iconPickerOpen = false;
  private savedFilter = '';

  iconControl = new FormControl('');

  private search$ = new Subject<string>();
  searchValue = '';

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    this.init();
    this.search$.pipe(debounceTime(250), distinctUntilChanged()).subscribe(q => {
      if (!this.editingNew) this.dataSource.filter = q.trim().toLowerCase();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.cancelEdit();
      this.init();
    }
  }

  private init(): void {
    this.displayedColumns = [...this.config.columns.map(c => c.field), 'actions'];
    this.dataSource.filterPredicate = (item: any, filter) =>
      !!item._isNew || (item[this.config.labelField] ?? '').toLowerCase().includes(filter);
    this.loadSelectOptions();
    this.loadData();
  }

  private loadSelectOptions(): void {
    const seen = new Set<string>();
    for (const col of this.config.columns) {
      if (col.type === 'select' && col.optionsPath && !seen.has(col.optionsPath)) {
        seen.add(col.optionsPath);
        this.settingsService.getAll(col.optionsPath).subscribe({
          next: (res) => {
            for (const c of this.config.columns) {
              if (c.optionsPath === col.optionsPath) this.selectOptions[c.field] = res.data ?? [];
            }
            for (const f of this.config.formFields) {
              if (f.optionsPath === col.optionsPath) this.selectOptions[f.field] = res.data ?? [];
            }
          },
        });
      }
    }
  }

  getOptionLabel(field: string, value: any, optionValue = 'id', optionLabel = 'description'): string {
    const opt = (this.selectOptions[field] ?? []).find(o => o[optionValue] === value);
    return opt ? opt[optionLabel] : value ?? '';
  }

  loadData(showSpinner = true): void {
    if (showSpinner) this.isLoading = true;
    this.settingsService.getAll(this.config.apiPath).subscribe({
      next: (res) => { this.dataSource.data = res.data ?? []; this.isLoading = false; },
      error: (err) => { this.notif.showError(err); this.isLoading = false; },
    });
  }

  onSearch(value: string): void {
    this.searchValue = value;
    this.search$.next(value);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.search$.next('');
  }

  // ── Inline editing ────────────────────────────────────────────────────────────

  startAdd(): void {
    if (this.editingRow || this.editingNew) return;
    this.editingNew = true;
    this.buildInlineForm(null);
    this.savedFilter = this.dataSource.filter;
    this.dataSource.filter = '';
    this.dataSource.data = [{ id: null, _isNew: true }, ...this.dataSource.data];
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  startEdit(row: any): void {
    if (row._isNew || this.editingRow?.id === row.id) return;
    this.cancelEdit();
    this.editingRow = row;
    this.buildInlineForm(row);
  }

  cancelEdit(): void {
    if (this.editingNew) {
      this.dataSource.data = this.dataSource.data.filter((r: any) => !r._isNew);
      this.dataSource.filter = this.savedFilter;
      this.editingNew = false;
    }
    this.editingRow = null;
    this.editingForm = null!;
    this.editingIconValue = '';
    this.iconPickerOpen = false;
  }

  saveInline(): void {
    if (!this.editingForm || this.editingForm.invalid) {
      this.editingForm?.markAllAsTouched();
      return;
    }

    const data: any = { ...this.editingForm.value };
    const iconField = this.config.formFields.find(f => f.type === 'icon');
    if (iconField) data[iconField.field] = this.editingIconValue;

    const obs = this.editingNew
      ? this.settingsService.create(this.config.apiPath, data)
      : this.settingsService.update(this.config.apiPath, this.editingRow.id, data);

    obs.subscribe({
      next: () => { this.cancelEdit(); this.loadData(false); },
      error: (err) => this.notif.showError(err),
    });
  }

  private buildInlineForm(item: any): void {
    const group: Record<string, any> = {};
    for (const field of this.config.formFields) {
      if (field.type === 'icon') continue;
      const val = item ? item[field.field] ?? '' : '';
      group[field.field] = [val, field.required ? [Validators.required] : []];
    }
    this.editingForm = this.fb.group(group);

    const iconField = this.config.formFields.find(f => f.type === 'icon');
    if (iconField) {
      this.editingIconValue = item ? item[iconField.field] ?? '' : '';
      this.iconControl.setValue(this.editingIconValue);
    }
  }

  get editControls(): { [key: string]: FormControl } {
    return (this.editingForm?.controls ?? {}) as { [key: string]: FormControl };
  }

  isRowEditing(row: any): boolean {
    return this.editingNew ? !!row._isNew : this.editingRow?.id === row.id;
  }

  // ── Icon picker ───────────────────────────────────────────────────────────────

  openIconPicker(): void { this.iconPickerOpen = true; }
  closeIconPicker(): void { this.iconPickerOpen = false; }

  onIconSelected(name: string): void {
    this.editingIconValue = name;
    this.iconControl.setValue(name);
    this.iconPickerOpen = false;
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  confirmDelete(item: any): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '380px',
      data: { name: item[this.config.labelField] },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteItem(item);
    });
  }

  private deleteItem(item: any): void {
    this.settingsService.delete(this.config.apiPath, item.id).subscribe({
      next: () => this.loadData(false),
      error: (err) => this.notif.showError(err),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  hasIconField(): boolean {
    return this.config.formFields.some(f => f.type === 'icon');
  }

  get filteredCount(): number {
    return this.dataSource.filteredData.filter((r: any) => !r._isNew).length;
  }
}
