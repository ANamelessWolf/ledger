import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogItem } from '@common/types/catalogTypes';
import { DEFAULT_MO_NO_INT_FILTER, MoNoIntFilter } from '@moNoInt/types/monthlyNoInterest';

export interface MoNoIntFilterFormData {
  current: MoNoIntFilter;
  walletGroups: CatalogItem[];
  isValid: () => boolean;
  getResult: () => MoNoIntFilter;
  reset: () => void;
}

@Component({
  selector: 'app-mo-no-int-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './mo-no-int-filter-dialog.component.html',
  styleUrl: './mo-no-int-filter-dialog.component.scss',
})
export class MoNoIntFilterDialogComponent implements OnInit {
  data!: MoNoIntFilterFormData;
  form!: FormGroup;

  statusOptions = [
    { value: 'active',   label: 'Activos'   },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'all',      label: 'Todos'     },
  ];

  months = [
    { value: 1,  label: 'Enero'      }, { value: 2,  label: 'Febrero'   },
    { value: 3,  label: 'Marzo'      }, { value: 4,  label: 'Abril'     },
    { value: 5,  label: 'Mayo'       }, { value: 6,  label: 'Junio'     },
    { value: 7,  label: 'Julio'      }, { value: 8,  label: 'Agosto'    },
    { value: 9,  label: 'Septiembre' }, { value: 10, label: 'Octubre'   },
    { value: 11, label: 'Noviembre'  }, { value: 12, label: 'Diciembre' },
  ];

  years: number[] = [];

  constructor(private fb: FormBuilder) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 3; y <= currentYear + 1; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    const c = this.data.current;
    this.form = this.fb.group({
      status:        [c.status],
      fromMonth:     [c.fromMonth],
      fromYear:      [c.fromYear],
      toMonth:       [c.toMonth],
      toYear:        [c.toYear],
      walletGroupId: [c.walletGroupId],
      showPaid:      [c.showPaid],
    });

    this.data.isValid   = () => true;
    this.data.getResult = () => this.form.value as MoNoIntFilter;
    this.data.reset     = () => this.form.patchValue({ ...DEFAULT_MO_NO_INT_FILTER });
  }
}
