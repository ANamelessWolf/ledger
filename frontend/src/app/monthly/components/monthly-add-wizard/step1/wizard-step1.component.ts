import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogItemSelectComponent } from '@common/components/catalog-item-select/catalog-item-select.component';
import { CatalogItem } from '@common/types/catalogTypes';
import { WizardCreditCard } from '@moNoInt/types/monthlyAddWizard.types';

@Component({
  selector: 'app-wizard-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    CatalogItemSelectComponent,
  ],
  templateUrl: './wizard-step1.component.html',
  styleUrl: './wizard-step1.component.scss',
})
export class WizardStep1Component {
  @Input() creditCards: WizardCreditCard[] = [];
  @Input() creditCardControl!: FormControl<CatalogItem | null>;
  @Input() monthsForm!: FormGroup;
  @Input() monthsOptions: number[] = [];
  @Input() isValid = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
