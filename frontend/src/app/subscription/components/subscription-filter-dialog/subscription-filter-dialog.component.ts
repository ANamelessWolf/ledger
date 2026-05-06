import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {
  DEFAULT_SUBSCRIPTION_FILTER,
  SubscriptionFilter,
  SubscriptionFilterDialogData,
} from '@subscription/types/subscriptionTypes';

@Component({
  selector: 'app-subscription-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './subscription-filter-dialog.component.html',
  styleUrl: './subscription-filter-dialog.component.scss',
})
export class SubscriptionFilterDialogComponent implements OnInit {
  form!: FormGroup;

  statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubscriptionFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubscriptionFilterDialogData
  ) {}

  ngOnInit(): void {
    const c = this.data.current;
    this.form = this.fb.group({
      status: [c.status],
      paymentFrequencyId: [c.paymentFrequencyId],
      walletGroupId: [c.walletGroupId],
    });
  }

  apply(): void {
    const filter: SubscriptionFilter = this.form.value;
    this.dialogRef.close(filter);
  }

  clear(): void {
    this.dialogRef.close({ ...DEFAULT_SUBSCRIPTION_FILTER });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
