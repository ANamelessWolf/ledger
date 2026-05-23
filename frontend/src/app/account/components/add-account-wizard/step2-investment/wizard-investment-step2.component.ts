import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyItem } from '../../../types/account.types';

@Component({
  selector: 'app-wizard-investment-step2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './wizard-investment-step2.component.html',
  styleUrl: './wizard-investment-step2.component.scss',
})
export class WizardInvestmentStep2Component {
  @Input() form!: FormGroup;
  @Input() currencies: CurrencyItem[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
