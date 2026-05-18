import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CatalogItem } from '@common/types/catalogTypes';
import { CurrencyItem } from '../../../types/account.types';
import { AccountService } from '../../../services/account.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-wizard-savings-step2',
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
  templateUrl: './wizard-savings-step2.component.html',
  styleUrl: './wizard-savings-step2.component.scss',
})
export class WizardSavingsStep2Component implements OnChanges {
  @Input() form!: FormGroup;
  @Input() currencies: CurrencyItem[] = [];
  @Input() entities: CatalogItem[] = [];
  @Input() walletGroups: CatalogItem[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  preferredWalletName = '';
  isResolvingWallet = false;
  walletError = '';

  constructor(private accountService: AccountService) {}

  ngOnChanges(changes: SimpleChanges): void {}

  onGroupOrCurrencyChange(): void {
    const groupId = this.form.get('walletGroupId')?.value;
    const currencyId = this.form.get('currencyId')?.value;
    if (!groupId || !currencyId) return;

    this.isResolvingWallet = true;
    this.walletError = '';
    this.preferredWalletName = '';
    this.form.get('preferredWalletId')?.setValue(null);

    this.accountService.getPreferredWallet(groupId, currencyId).subscribe({
      next: (response) => {
        const wallet = response.data;
        this.form.get('preferredWalletId')?.setValue(wallet.id);
        this.preferredWalletName = wallet.name;
        this.isResolvingWallet = false;
      },
      error: (err: HttpErrorResponse) => {
        this.walletError = 'No wallet found for this group and currency combination';
        this.isResolvingWallet = false;
      },
    });
  }
}
