import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toNumber } from '@common/utils/formatUtils';
import { CardMiniatureComponent } from '../card-miniature/card-miniature.component';
import { CardItem, CardType } from '@common/types/cardItem';
import { DebitCardSummary } from '@common/types/debitCardSummary';

const NUM_REG = /^\d+(\.\d{1,2})?$/;

@Component({
  selector: 'app-debit-card-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    CardMiniatureComponent,
  ],
  templateUrl: './debit-card-edit-form.component.html',
  styleUrl: './debit-card-edit-form.component.scss',
})
export class DebitCardEditFormComponent {
  editForm: FormGroup;
  card: DebitCardSummary;
  item: CardItem;
  header: string = '';
  options: any;
  cardType: CardType = CardType.OTHER;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<DebitCardEditFormComponent>,
    private fb: FormBuilder
  ) {
    this.card = this.dialogData.card;
    this.item = this.dialogData.item;
    this.header = this.dialogData.header;
    this.options = this.dialogData.options;

    const iRate = +this.card.investmentRate.replace(' %', '');
    const expMonth = this.card.expiration.split('/')[0];
    const expYear = +this.card.expiration.split('/')[1] + 2000;
    const status = this.item.active;

    this.editForm = this.fb.group({
      total: [
        toNumber(this.card.total),
        [Validators.required, Validators.pattern(NUM_REG)],
      ],
      interestRate: [
        iRate,
        [Validators.required, Validators.pattern(NUM_REG)],
      ],
      cutDay: [this.card.cutday, [Validators.required, Validators.pattern(NUM_REG)]],
      expMonth: [+expMonth, [Validators.required, Validators.pattern(NUM_REG)]],
      expYear: [+expYear, [Validators.required, Validators.pattern(NUM_REG)]],
      ending: [
        this.card.ending,
        [Validators.required, Validators.pattern(NUM_REG)],
      ],
      color: [this.card.color, [Validators.required]],
      active: [status, [Validators.required]],
    });
  }

  get total() {
    return this.editForm.get('total');
  }
  get interestRate() {
    return this.editForm.get('interestRate');
  }
  get cutDay() {
    return this.editForm.get('cutDay');
  }
  get expMonth() {
    return this.editForm.get('expMonth');
  }
  get expYear() {
    return this.editForm.get('expYear');
  }
  get expiration() {
    const endYear = (this.expYear?.value + '').substring(2);
    const endMonth = String(this.expMonth?.value + '').padStart(2, '0');
    return `${endMonth}/${endYear}`;
  }
  get ending() {
    return this.editForm.get('ending');
  }
  get color() {
    return this.editForm.get('color');
  }
  get active() {
    return this.editForm.get('active');
  }

  onSubmit() {
    if (this.editForm.valid) {
      const id = this.card.id;
      const body: any = {
        ...this.editForm.value,
        expiration: this.expiration,
      };
      delete body.expMonth;
      delete body.expYear;
      this.dialogData.formSubmitted({ id, body });
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
