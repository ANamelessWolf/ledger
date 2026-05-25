import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LedgerIconComponent } from '@common/components/ledger-icon/ledger-icon.component';
import { SVG_ICON_REGISTRY } from '@config/svg-icon-registry';

export interface IconEntry {
  name: string;
  category: string;
  type?: 'material' | 'svg';
}

export const MATERIAL_ICONS: IconEntry[] = [
  // Finance & Money
  { name: 'payments',           category: 'Finance' },
  { name: 'credit_card',        category: 'Finance' },
  { name: 'monetization_on',    category: 'Finance' },
  { name: 'account_balance',    category: 'Finance' },
  { name: 'trending_up',        category: 'Finance' },
  { name: 'trending_down',      category: 'Finance' },
  { name: 'savings',            category: 'Finance' },
  { name: 'receipt_long',       category: 'Finance' },
  { name: 'receipt',            category: 'Finance' },
  { name: 'attach_money',       category: 'Finance' },
  { name: 'currency_exchange',  category: 'Finance' },
  { name: 'wallet',             category: 'Finance' },
  { name: 'price_check',        category: 'Finance' },
  // Food & Drink
  { name: 'restaurant',         category: 'Food & Drink' },
  { name: 'lunch_dining',       category: 'Food & Drink' },
  { name: 'ramen_dining',       category: 'Food & Drink' },
  { name: 'coffee',             category: 'Food & Drink' },
  { name: 'local_bar',          category: 'Food & Drink' },
  { name: 'sports_bar',         category: 'Food & Drink' },
  { name: 'icecream',           category: 'Food & Drink' },
  { name: 'cake',               category: 'Food & Drink' },
  { name: 'blender',            category: 'Food & Drink' },
  { name: 'kitchen',            category: 'Food & Drink' },
  { name: 'set_meal',           category: 'Food & Drink' },
  { name: 'fastfood',           category: 'Food & Drink' },
  { name: 'local_pizza',        category: 'Food & Drink' },
  // Shopping
  { name: 'shopping_bag',       category: 'Shopping' },
  { name: 'shopping_cart',      category: 'Shopping' },
  { name: 'shopping_basket',    category: 'Shopping' },
  { name: 'store',              category: 'Shopping' },
  { name: 'storefront',         category: 'Shopping' },
  { name: 'checkroom',          category: 'Shopping' },
  { name: 'card_giftcard',      category: 'Shopping' },
  { name: 'redeem',             category: 'Shopping' },
  // Transport
  { name: 'directions_car',     category: 'Transport' },
  { name: 'local_taxi',         category: 'Transport' },
  { name: 'local_shipping',     category: 'Transport' },
  { name: 'flight',             category: 'Transport' },
  { name: 'train',              category: 'Transport' },
  { name: 'subway',             category: 'Transport' },
  { name: 'directions_bus',     category: 'Transport' },
  { name: 'two_wheeler',        category: 'Transport' },
  { name: 'local_gas_station',  category: 'Transport' },
  { name: 'local_parking',      category: 'Transport' },
  // Health
  { name: 'medical_services',   category: 'Health' },
  { name: 'medication',         category: 'Health' },
  { name: 'medical_information', category: 'Health' },
  { name: 'health_and_safety',  category: 'Health' },
  { name: 'favorite',           category: 'Health' },
  { name: 'healing',            category: 'Health' },
  { name: 'vaccines',           category: 'Health' },
  { name: 'fitness_center',     category: 'Health' },
  { name: 'self_improvement',     category: 'Health' },
  // Home
  { name: 'home',               category: 'Home' },
  { name: 'house',              category: 'Home' },
  { name: 'apartment',          category: 'Home' },
  { name: 'bed',                category: 'Home' },
  { name: 'chair',              category: 'Home' },
  { name: 'roofing',            category: 'Home' },
  { name: 'plumbing',           category: 'Home' },
  { name: 'build',              category: 'Home' },
  { name: 'lightbulb',          category: 'Home' },
  { name: 'power',              category: 'Home' },
  { name: 'water_drop',         category: 'Home' },
  // Entertainment
  { name: 'movie',              category: 'Entertainment' },
  { name: 'tv',                 category: 'Entertainment' },
  { name: 'music_note',         category: 'Entertainment' },
  { name: 'sports_esports',     category: 'Entertainment' },
  { name: 'casino',             category: 'Entertainment' },
  { name: 'theater_comedy',     category: 'Entertainment' },
  { name: 'confirmation_number', category: 'Entertainment' },
  { name: 'local_activity',     category: 'Entertainment' },
  { name: 'palette',            category: 'Entertainment' },
  { name: 'brush',              category: 'Entertainment' },
  // Technology
  { name: 'computer',           category: 'Technology' },
  { name: 'laptop',             category: 'Technology' },
  { name: 'smartphone',         category: 'Technology' },
  { name: 'tablet',             category: 'Technology' },
  { name: 'memory',             category: 'Technology' },
  { name: 'devices',            category: 'Technology' },
  { name: 'headphones',         category: 'Technology' },
  { name: 'camera',             category: 'Technology' },
  { name: 'wifi',               category: 'Technology' },
  // Education
  { name: 'school',             category: 'Education' },
  { name: 'menu_book',          category: 'Education' },
  { name: 'library_books',      category: 'Education' },
  { name: 'science',            category: 'Education' },
  { name: 'calculate',          category: 'Education' },
  // Travel & Places
  { name: 'hotel',              category: 'Travel' },
  { name: 'beach_access',       category: 'Travel' },
  { name: 'luggage',            category: 'Travel' },
  { name: 'map',                category: 'Travel' },
  { name: 'explore',            category: 'Travel' },
  { name: 'hiking',             category: 'Travel' },
  // Services
  { name: 'content_cut',        category: 'Services' },
  { name: 'dry_cleaning',       category: 'Services' },
  { name: 'local_laundry_service', category: 'Services' },
  { name: 'cleaning_services',  category: 'Services' },
  { name: 'handyman',           category: 'Services' },
  { name: 'swap_horiz',         category: 'Services' },
  { name: 'chat_bubble',        category: 'Services' },
  { name: 'support_agent',      category: 'Services' },
  // General
  { name: 'category',           category: 'General' },
  { name: 'label',              category: 'General' },
  { name: 'star',               category: 'General' },
  { name: 'bookmark',           category: 'General' },
  { name: 'business',           category: 'General' },
  { name: 'work',               category: 'General' },
  { name: 'people',             category: 'General' },
  { name: 'person',             category: 'General' },
  { name: 'calendar_today',     category: 'General' },
  { name: 'calendar_month',     category: 'General' },
  { name: 'visibility',         category: 'General' },
  { name: 'circle',             category: 'General' },
  { name: 'percent',            category: 'General' },
  { name: 'percent',            category: 'General' },
];

const LOCAL_SVG_ICONS: IconEntry[] = SVG_ICON_REGISTRY.map(e => ({ ...e, type: 'svg' as const }));

const ALL_ICONS: IconEntry[] = [...LOCAL_SVG_ICONS, ...MATERIAL_ICONS];

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    LedgerIconComponent,
  ],
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
})
export class IconPickerComponent implements OnInit {
  @Input() control: FormControl = new FormControl('');
  @Output() selected = new EventEmitter<string>();

  searchControl = new FormControl('');
  filteredIcons: IconEntry[] = [];
  categories: string[] = [];

  ngOnInit(): void {
    this.applyFilter('');
    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(q => this.applyFilter(q ?? ''));
  }

  private applyFilter(q: string): void {
    const query = q.toLowerCase();
    const filtered = query
      ? ALL_ICONS.filter(i => i.name.includes(query) || i.category.toLowerCase().includes(query))
      : ALL_ICONS;
    // dedupe (some icons appear twice in list)
    const seen = new Set<string>();
    this.filteredIcons = filtered.filter(i => {
      if (seen.has(i.name)) return false;
      seen.add(i.name);
      return true;
    });
    this.categories = [...new Set(this.filteredIcons.map(i => i.category))].sort();
  }

  iconsForCategory(cat: string): IconEntry[] {
    return this.filteredIcons.filter(i => i.category === cat);
  }

  pick(name: string): void {
    this.control.setValue(name);
    this.selected.emit(name);
  }

  isSelected(name: string): boolean {
    return this.control.value === name;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
