import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { WizardAccountStep1Component } from './step1/wizard-account-step1.component';
import { WizardSavingsStep2Component } from './step2-savings/wizard-savings-step2.component';
import { WizardInvestmentStep2Component } from './step2-investment/wizard-investment-step2.component';
import { AccountService } from '../../services/account.service';
import { CatalogItem } from '@common/types/catalogTypes';
import { CurrencyItem } from '../../types/account.types';
import { NotificationService } from '@common/services/notification.service';

export interface AddAccountWizardData {
  financingTypes: CatalogItem[];
  currencies: CurrencyItem[];
  entities: CatalogItem[];
  walletGroups: CatalogItem[];
  accountService: AccountService;
}

@Component({
  selector: 'app-add-account-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatStepperModule,
    MatIconModule,
    WizardAccountStep1Component,
    WizardSavingsStep2Component,
    WizardInvestmentStep2Component,
  ],
  templateUrl: './add-account-wizard.component.html',
  styleUrl: './add-account-wizard.component.scss',
  providers: [NotificationService],
})
export class AddAccountWizardComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  step1Form!: FormGroup;
  savingsForm!: FormGroup;
  investmentForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddAccountWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddAccountWizardData,
    private accountService: AccountService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      accountKind: [null, Validators.required],
      financingTypeId: [null, Validators.required],
    });

    this.savingsForm = this.fb.group({
      walletGroupId: [null, Validators.required],
      currencyId: [null, Validators.required],
      entityId: [null, Validators.required],
      preferredWalletId: [null, Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
    });

    this.investmentForm = this.fb.group({
      currencyId: [null, Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get isSavingsType(): boolean {
    return this.step1Form.get('accountKind')?.value === 'savings';
  }

  get isStep1Valid(): boolean {
    return this.step1Form.valid;
  }

  onStep1Next(): void {
    if (this.step1Form.valid) {
      this.stepper.next();
    }
  }

  onConfirm(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const { name, description, financingTypeId } = this.step1Form.value;
    const payload: any = { name, description, financingTypeId };

    if (this.isSavingsType) {
      const { walletGroupId, currencyId, entityId, preferredWalletId, balance } =
        this.savingsForm.value;
      payload.savings = { preferredWalletId, walletGroupId, entityId, currencyId, balance };
    } else {
      const { currencyId, balance } = this.investmentForm.value;
      payload.investment = { currencyId, balance };
    }

    this.accountService.createAccount(payload).subscribe({
      next: () => {
        this.dialogRef.close({ created: true });
      },
      error: (err) => {
        this.notifService.showError(err);
        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({ created: false });
  }
}
