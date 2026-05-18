import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { CatalogItem } from '@common/types/catalogTypes';

@Component({
  selector: 'app-wizard-account-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
  ],
  templateUrl: './wizard-account-step1.component.html',
  styleUrl: './wizard-account-step1.component.scss',
})
export class WizardAccountStep1Component {
  @Input() form!: FormGroup;
  @Input() financingTypes: CatalogItem[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  readonly kinds = [
    { value: 'savings', icon: 'savings', label: 'Savings', description: 'Track savings goals and wallet balances' },
    { value: 'investment', icon: 'trending_up', label: 'Investment', description: 'Monitor your investment portfolio and returns' },
  ];

  selectKind(value: string): void {
    this.form.get('accountKind')?.setValue(value);
  }
}
