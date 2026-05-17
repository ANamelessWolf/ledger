import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CreditCardSummary } from '@common/types/creditCardSummary';
import { CardItem } from '@common/types/cardItem';
import { CreditCardBody, CreditCardRequest } from '@common/types/cardPayment';
import { toNumber } from '@common/utils/formatUtils';
import { CardMiniatureComponent } from '../card-miniature/card-miniature.component';
import { CurrencyInputDirective } from '@common/directives/currency-input.directive';

const NUM_REG = /^\d+(\.\d{1,2})?$/;
const CARD_NATURAL_W = 360;
const CARD_NATURAL_H = 218;

export interface CreditCardEditData {
  card: CreditCardSummary;
  item: CardItem;
  options: {
    days: number[];
    months: number[];
    years: number[];
    colors: string[];
    status: { value: number; description: string }[];
  };
  isValid: () => boolean;
  getResult: () => CreditCardRequest;
}

@Component({
  selector: 'app-credit-card-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CardMiniatureComponent,
    CurrencyInputDirective,
  ],
  templateUrl: './credit-card-edit-form.component.html',
  styleUrl: './credit-card-edit-form.component.scss',
})
export class CreditCardEditFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardPreview') cardPreviewRef!: ElementRef<HTMLElement>;

  // Set by dialog-wrapper
  data!: CreditCardEditData;

  editForm!: FormGroup;

  cardScale = 0.8;
  private resizeObserver!: ResizeObserver;

  constructor(private fb: FormBuilder, private zone: NgZone) {}

  get cardW(): number { return CARD_NATURAL_W * this.cardScale; }
  get cardH(): number { return CARD_NATURAL_H * this.cardScale; }

  ngOnInit(): void {
    const { card, item } = this.data;

    const cutDay   = card.status.cutDate.split(' ')[1].replace(',', '');
    const dueDay   = card.status.dueDate.split(' ')[1].replace(',', '');
    const expMonth = card.expiration.split('/')[0];
    const expYear  = +card.expiration.split('/')[1] + 2000;

    this.editForm = this.fb.group({
      credit:     [toNumber(card.credit),     [Validators.required]],
      usedCredit: [toNumber(card.usedCredit), [Validators.required]],
      cutDay:     [+cutDay,   [Validators.required]],
      dueDay:     [+dueDay,   [Validators.required]],
      expMonth:   [+expMonth, [Validators.required]],
      expYear:    [+expYear,  [Validators.required]],
      ending:     [card.ending, [Validators.required, Validators.pattern(NUM_REG)]],
      color:      [card.color,  [Validators.required]],
      active:     [item.active, [Validators.required]],
    });

    this.data.isValid   = () => this.editForm.valid;
    this.data.getResult = () => this.buildResult();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) {
        this.zone.run(() => {
          this.cardScale = w / CARD_NATURAL_W;
        });
      }
    });
    this.resizeObserver.observe(this.cardPreviewRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  get credit()     { return this.editForm.get('credit'); }
  get usedCredit() { return this.editForm.get('usedCredit'); }
  get cutDay()     { return this.editForm.get('cutDay'); }
  get dueDay()     { return this.editForm.get('dueDay'); }
  get expMonth()   { return this.editForm.get('expMonth'); }
  get expYear()    { return this.editForm.get('expYear'); }
  get ending()     { return this.editForm.get('ending'); }
  get color()      { return this.editForm.get('color'); }
  get active()     { return this.editForm.get('active'); }

  get expiration(): string {
    const endYear  = (this.expYear?.value + '').substring(2);
    const endMonth = String(this.expMonth?.value ?? '').padStart(2, '0');
    return `${endMonth}/${endYear}`;
  }

  private buildResult(): CreditCardRequest {
    const body: CreditCardBody = { ...this.editForm.value, expiration: this.expiration };
    delete (body as any).expMonth;
    delete (body as any).expYear;
    return { id: this.data.card.id, body };
  }
}
