import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyItem, WalletGroupDetail, WalletItem, WalletMemberItem } from '../../types/wallet.types';
import { CurrencyDualListComponent } from '../currency-dual-list/currency-dual-list.component';

export interface WalletGroupModalData {
  mode: 'add' | 'edit';
  currencies: CurrencyItem[];
  group?: WalletGroupDetail;
  availableWallets?: WalletItem[];
  onValidate?: () => boolean;
  result?: {
    name: string;
    currencyIds?: number[];
    memberUpdates?: { memberId: number; forwardWalletId: number | null }[];
  };
}

@Component({
  selector: 'app-wallet-group-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    CurrencyDualListComponent,
  ],
  templateUrl: './wallet-group-modal.component.html',
  styleUrl: './wallet-group-modal.component.scss',
})
export class WalletGroupModalComponent implements OnInit {
  @Input() data!: WalletGroupModalData;
  @ViewChild(CurrencyDualListComponent) dualList!: CurrencyDualListComponent;

  form!: FormGroup;
  memberControls: FormControl[] = [];

  get members(): WalletMemberItem[] {
    return this.data.group?.members ?? [];
  }

  forwardWalletsFor(member: WalletMemberItem): WalletItem[] {
    const groupId = this.data.group?.id;
    return (this.data.availableWallets ?? []).filter(
      (w) => w.walletGroupId !== groupId && w.currencyId === member.currencyId
    );
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.group?.name ?? '', [Validators.required, Validators.maxLength(40)]],
    });

    if (this.data.mode === 'edit') {
      this.memberControls = this.members.map(
        (m) => new FormControl(m.forwardWalletId ?? null)
      );
    }

    this.data.onValidate = () => {
      this.form.markAllAsTouched();
      if (!this.form.valid) return false;
      if (this.data.mode === 'add' && this.dualList.added.length === 0) return false;

      this.data.result = {
        name: this.form.value.name,
        currencyIds: this.data.mode === 'add' ? this.dualList.added.map((c) => c.id) : undefined,
        memberUpdates: this.data.mode === 'edit'
          ? this.members.map((m, i) => ({
              memberId: m.memberId,
              forwardWalletId: this.memberControls[i].value,
            }))
          : undefined,
      };
      return true;
    };
  }

  get isAdd(): boolean {
    return this.data.mode === 'add';
  }
}
