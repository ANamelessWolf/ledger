import { Component, Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CARD_STATUS,
  CardFilter,
  CardFilterOptions,
} from '@common/types/cardItem';
import { HEADERS } from '@config/messages';
import { CatalogItem } from '@common/types/catalogTypes';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
@Component({
  selector: 'app-card-list-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    ReactiveFormsModule,
    DialogModule,
    CatalogItemSelectComponent
  ],
  templateUrl: './card-list-filter.component.html',
  styleUrl: './card-list-filter.component.scss',
})
export class CardListFilterComponent {
  filterForm: FormGroup;
  entityControl = new FormControl();

  cardTypes = [
    { name: 'isCreditCard', value: '1', description: HEADERS.C_CARD },
    { name: 'isDebitCard', value: '2', description: HEADERS.D_CARD },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CardListFilterComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      options: CardFilterOptions;
      filterSelected: (filter: CardFilter) => void;
    }
  ) {
    let filter = {
      entityId: 0,
      crediCardType: 2,
      active: CARD_STATUS.ANY,
    };
    if (data.options.filter) {
      filter = data.options.filter;
    }
    const selEntName = data.options.entities.filter(
      (x: CatalogItem) => x.id === filter.entityId
    );
    const entName: string =
      selEntName.length > 0 ? selEntName[0].name : HEADERS.ANY;
    this.filterForm = this.fb.group({
      entityId: [filter.entityId],
      entityName: [entName],
      isCreditCard: [filter.crediCardType === 1 || filter.crediCardType === 2],
      isDebitCard: [filter.crediCardType === 0 || filter.crediCardType === 2],
      active: [filter.active],
    });

    this.entityControl.setValue(entName);
  }

  getCreditCardType(form: FormGroup<any>): number {
    if (form.value.isCreditCard && form.value.isDebitCard) return 2;
    else return form.value.isCreditCard ? 1 : 0;
  }

  onApply() {
    if (this.filterForm.valid) {
      const selectedEntity = this.entityControl.value;
      const filter: CardFilter = {
        entityId: selectedEntity ? selectedEntity.id : 0,
        crediCardType: this.getCreditCardType(this.filterForm),
        active: this.filterForm.value.active,
      };
      this.data.filterSelected(filter);
      this.dialogRef.close();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}
