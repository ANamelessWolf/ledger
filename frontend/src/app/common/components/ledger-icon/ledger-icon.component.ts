import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconType } from '@config/commonTypes';
import { CUSTOM_SVG_ICON_NAMES } from '@config/svg-icon-registry';

const SIZE_MAP: Record<string, string> = {
  '1x': '24px',
  '2x': '32px',
  '3x': '48px',
  '4x': '64px',
};

@Component({
  selector: 'app-ledger-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ledger-icon.component.html',
  styleUrl: './ledger-icon.component.scss',
})
export class LedgerIconComponent {
  @Input() type: IconType = IconType.NORMAL; // kept for API compatibility
  @Input() iconName = 'shopping_bag';
  @Input() iconSize = '1x';

  get isCustomSvg(): boolean {
    return CUSTOM_SVG_ICON_NAMES.has(this.iconName);
  }

  get svgPath(): string {
    return `assets/icons/${this.iconName}.svg`;
  }

  get sizePx(): string {
    return SIZE_MAP[this.iconSize] ?? this.iconSize;
  }
}
