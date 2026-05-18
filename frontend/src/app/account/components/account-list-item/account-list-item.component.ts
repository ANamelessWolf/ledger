import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FinancingAccountItem } from '../../types/account.types';

@Component({
  selector: 'app-account-list-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './account-list-item.component.html',
  styleUrl: './account-list-item.component.scss',
})
export class AccountListItemComponent {
  @Input() isSelected: boolean = false;
  @Input() data!: FinancingAccountItem;

  get isSavings(): boolean {
    return this.data?.accountType === 'savings';
  }

  get typeIcon(): string {
    return this.isSavings ? 'savings' : 'trending_up';
  }

  get typeLabel(): string {
    return this.isSavings ? 'Savings' : 'Investment';
  }
}
