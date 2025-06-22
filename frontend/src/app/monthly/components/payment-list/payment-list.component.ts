import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { MatButtonModule } from '@angular/material/button';
import { InstallmentPayment } from '@moNoInt/types/monthlyNoInterest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LedgerIconComponent,
  ],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent {
  payments: InstallmentPayment[] = [];
  installmentId: Number;
  displayedColumns: string[] = ['expense', 'total', 'buyDate', 'actions'];
  isProcessing: boolean = false;
  error: boolean = false;

  public constructor(
    public dialogRef: MatDialogRef<PaymentListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      installmentId: Number;
      payments: InstallmentPayment[];
      pay: (installmentId: Number, paymentId: Number) => Observable<any>;
      onClose: () => void;
    }
  ) {
    this.installmentId = this.data.installmentId;
    this.payments = this.data.payments;
  }

  pay(row: InstallmentPayment) {
    this.isProcessing = true;
    this.error = false;
    this.data.pay(row.id, row.paymentId).subscribe(
      (response) => {
        const result = response.data;
        console.log(result);
      },
      this.errorResponse,
      () => {
        row.isPaid = true;
        this.isProcessing = false;
      }
    );
  }

  private errorResponse(err: HttpErrorResponse) {
    console.log(err.message);
    this.error = true;
  }

  close() {
    this.data.onClose();
    this.dialogRef.close();
  }
}
