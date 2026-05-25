import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogItem } from '@common/types/catalogTypes';
import {
  DEFAULT_SUBSCRIPTION_FILTER,
  SubscriptionFilter,
} from '@subscription/types/subscriptionTypes';

export interface SubscriptionFilterFormData {
  current: SubscriptionFilter;
  paymentFrequencies: CatalogItem[];
  walletGroups: CatalogItem[];
  isValid: () => boolean;
  getResult: () => SubscriptionFilter;
  reset: () => void;
}

@Component({
  selector: 'app-subscription-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './subscription-filter-dialog.component.html',
  styleUrl: './subscription-filter-dialog.component.scss',
})
export class SubscriptionFilterDialogComponent implements OnInit {
  data!: SubscriptionFilterFormData;
  form!: FormGroup;

  statusOptions = [
    { value: 'all',      label: 'All' },
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const c = this.data.current;
    this.form = this.fb.group({
      status:             [c.status],
      paymentFrequencyId: [c.paymentFrequencyId],
      walletGroupId:      [c.walletGroupId],
    });

    this.data.isValid   = () => true;
    this.data.getResult = () => this.form.value as SubscriptionFilter;
    this.data.reset     = () => this.form.patchValue({ ...DEFAULT_SUBSCRIPTION_FILTER });
  }
}
