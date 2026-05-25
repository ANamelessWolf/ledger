import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { WalletService } from '../../services/wallet.service';
import { WalletItem } from '../../types/wallet.types';

interface WalletGroup {
  groupName: string;
  wallets: WalletItem[];
}

@Component({
  selector: 'app-wallet-picker',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './wallet-picker.component.html',
  styleUrl: './wallet-picker.component.scss',
})
export class WalletPickerComponent implements OnInit {
  @Input() control: FormControl = new FormControl();
  @Input() initialGroupId: number | null = null;
  @Input() initialCurrencyId: number | null = null;

  @Input() set filterGroupId(value: number | null) {
    if (this.filterGroupId$.value !== value) {
      this.filterGroupId$.next(value);
      this.searchControl.setValue('');
      this.control.setValue(null);
    }
  }

  @Output() walletChanged = new EventEmitter<WalletItem>();
  @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger;

  searchControl = new FormControl<string | WalletItem>('');
  groupedWallets$: Observable<WalletGroup[]> = of([]);

  private allWallets: WalletItem[] = [];
  private filterGroupId$ = new BehaviorSubject<number | null>(null);

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.getAllWallets().subscribe({
      next: (res) => {
        this.allWallets = res.data ?? [];

        if (this.initialGroupId != null && this.initialCurrencyId != null) {
          const match = this.allWallets.find(
            (w) => w.walletGroupId === this.initialGroupId && w.currencyId === this.initialCurrencyId
          );
          if (match) {
            this.searchControl.setValue(match);
            this.control.setValue(match.id);
          }
        }

        this.groupedWallets$ = combineLatest([
          this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
          this.filterGroupId$,
        ]).pipe(
          map(([value, groupId]) => {
            const search = typeof value === 'string' ? value : (value as WalletItem)?.name ?? '';
            return this.filterAndGroup(search, groupId);
          })
        );
      },
    });
  }

  private filterAndGroup(search: string, groupId: number | null): WalletGroup[] {
    const q = search.toLowerCase();
    let filtered = this.allWallets;

    filtered = filtered.filter((w) => w.walletGroupIsActive === 1);

    if (groupId != null) {
      filtered = filtered.filter((w) => w.walletGroupId === groupId);
    }

    filtered = filtered.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.currencyName.toLowerCase().includes(q) ||
        (w.walletGroupName ?? '').toLowerCase().includes(q)
    );

    const map = new Map<string, WalletItem[]>();
    for (const w of filtered) {
      const key = w.walletGroupName ?? 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([groupName, wallets]) => ({ groupName, wallets }));
  }

  displayFn(wallet: WalletItem | null): string {
    return wallet?.name ?? '';
  }

  onSelected(event: MatAutocompleteSelectedEvent): void {
    const wallet: WalletItem = event.option.value;
    this.control.setValue(wallet.id);
    this.walletChanged.emit(wallet);
  }

  openPanel(): void {
    this.searchControl.setValue('', { emitEvent: true });
    this.trigger.openPanel();
  }
}
