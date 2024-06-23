import { Component, Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CARD_STATUS,
  CardFilter,
  CardFilterOptions,
} from '@common/types/cardItem';
import { HEADERS } from '@config/messages';
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
    MatButtonModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  templateUrl: './card-list-filter.component.html',
  styleUrl: './card-list-filter.component.scss',
})
export class CardListFilterComponent {
  filterForm: FormGroup;

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
    this.filterForm = this.fb.group({
      entityId: [filter.entityId],
      isCreditCard: [filter.crediCardType === 1 || filter.crediCardType === 2],
      isDebitCard: [filter.crediCardType === 0 || filter.crediCardType === 2],
      active: [filter.active],
    });
  }

  getCreditCardType(form: FormGroup<any>):number {
    if (form.value.isCreditCard && form.value.isDebitCard) return 2;
    else return form.value.isCreditCard ? 1 : 0;
  }

  onApply() {
    if (this.filterForm.valid) {
      const filter: CardFilter = {
        entityId: this.filterForm.value.entityId,
        crediCardType: this.getCreditCardType(this.filterForm),
        active: this.filterForm.value.active
      };
      this.data.filterSelected(filter);
      this.dialogRef.close();
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
}
