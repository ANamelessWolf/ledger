import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  DEFAULT_MO_NO_INT_FILTER,
  MoNoIntFilter,
  MoNoIntFilterDialogData,
} from '@moNoInt/types/monthlyNoInterest';

@Component({
  selector: 'app-mo-no-int-filter-dialog',
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
  templateUrl: './mo-no-int-filter-dialog.component.html',
  styleUrl: './mo-no-int-filter-dialog.component.scss',
})
export class MoNoIntFilterDialogComponent implements OnInit {
  form!: FormGroup;

  statusOptions = [
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'all', label: 'Todos' },
  ];

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  years: number[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MoNoIntFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoNoIntFilterDialogData
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    const c = this.data.current;
    this.form = this.fb.group({
      status: [c.status],
      fromMonth: [c.fromMonth],
      fromYear: [c.fromYear],
      toMonth: [c.toMonth],
      toYear: [c.toYear],
      walletGroupId: [c.walletGroupId],
    });
  }

  apply(): void {
    const filter: MoNoIntFilter = this.form.value;
    this.dialogRef.close(filter);
  }

  clear(): void {
    this.dialogRef.close({ ...DEFAULT_MO_NO_INT_FILTER });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
