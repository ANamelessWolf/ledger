import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CARD_STATUS, CardFilter, CardFilterOptions } from '@common/types/cardItem';
import { HEADERS } from '@config/messages';
import { CatalogItem } from '@common/types/catalogTypes';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';

export interface CardFilterDialogData {
  options: CardFilterOptions;
  getFilter: (() => CardFilter) | null;
  _clearFn: (() => void) | null;
}

@Component({
  selector: 'app-card-list-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CatalogItemSelectComponent,
  ],
  templateUrl: './card-list-filter.component.html',
  styleUrl: './card-list-filter.component.scss',
})
export class CardListFilterComponent implements OnInit {
  // Set by dialog-wrapper
  data!: CardFilterDialogData;

  filterForm!: FormGroup;
  entityControl = new FormControl();

  cardTypes = [
    { name: 'isCreditCard', description: HEADERS.C_CARD },
    { name: 'isDebitCard',  description: HEADERS.D_CARD },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const filter: CardFilter = this.data.options.filter ?? {
      entityId: 0,
      crediCardType: 2,
      active: CARD_STATUS.ANY,
      showCancelled: false,
    };

    const selEnt = this.data.options.entities.find((x: CatalogItem) => x.id === filter.entityId);
    const entName = selEnt?.name ?? HEADERS.ANY;

    this.filterForm = this.fb.group({
      isCreditCard:  [filter.crediCardType === 1 || filter.crediCardType === 2],
      isDebitCard:   [filter.crediCardType === 0 || filter.crediCardType === 2],
      showActive:    [filter.active === CARD_STATUS.ACTIVE   || filter.active === CARD_STATUS.ANY],
      showInactive:  [filter.active === CARD_STATUS.INACTIVE || filter.active === CARD_STATUS.ANY],
      showCancelled: [filter.showCancelled ?? false],
    });

    this.entityControl.setValue(entName);

    // Register callbacks so dialog-wrapper can reach them
    this.data.getFilter = () => this.computeFilter();
    this.data._clearFn  = () => this.doClear();
  }

  get anyStatus(): boolean {
    return this.filterForm.value.showActive && this.filterForm.value.showInactive;
  }

  toggleAny(): void {
    const next = !this.anyStatus;
    this.filterForm.patchValue({ showActive: next, showInactive: next });
  }

  private computeFilter(): CardFilter {
    const { isCreditCard, isDebitCard, showActive, showInactive, showCancelled } = this.filterForm.value;
    const selectedEntity = this.entityControl.value;

    let crediCardType = 2;
    if (isCreditCard && isDebitCard) crediCardType = 2;
    else if (isCreditCard) crediCardType = 1;
    else crediCardType = 0;

    let active: number;
    if (showActive && showInactive) active = CARD_STATUS.ANY;
    else if (showActive)            active = CARD_STATUS.ACTIVE;
    else if (showInactive)          active = CARD_STATUS.INACTIVE;
    else                            active = CARD_STATUS.ANY;

    return {
      entityId: selectedEntity?.id ?? 0,
      crediCardType,
      active,
      showCancelled,
    };
  }

  private doClear(): void {
    this.filterForm.patchValue({
      isCreditCard:  true,
      isDebitCard:   true,
      showActive:    true,
      showInactive:  true,
      showCancelled: false,
    });
    const anyEnt = this.data.options.entities.find((e) => e.id === 0);
    this.entityControl.setValue(anyEnt ?? { id: 0, name: HEADERS.ANY });
  }
}
