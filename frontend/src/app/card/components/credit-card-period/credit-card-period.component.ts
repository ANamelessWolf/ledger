import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CardService } from '@card/services/card.service';
import { DateRange } from '@expense/types/expensesTypes';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-credit-card-period',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './credit-card-period.component.html',
  styleUrl: './credit-card-period.component.scss',
})
export class CreditCardPeriodComponent implements OnInit {
  @Input() walletGroupId = 0;
  @Output() periodChange = new EventEmitter<DateRange>();

  periodKeys: string[] = [];
  selectedKey = '';

  private periodsMap = new Map<string, DateRange>();
  private destroyRef = inject(DestroyRef);

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    combineLatest([this.cardService.cardPeriods$, this.cardService.currentPeriodKey$])
      .pipe(
        filter(([periods]) => periods.size > 0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([periods, currentKey]) => {
        this.periodsMap = periods;
        this.periodKeys = Array.from(periods.keys());
        this.selectedKey = currentKey;
      });
  }

  onPeriodSelected(key: string): void {
    const range = this.periodsMap.get(key);
    if (range) {
      this.periodChange.emit(range);
    }
  }
}
