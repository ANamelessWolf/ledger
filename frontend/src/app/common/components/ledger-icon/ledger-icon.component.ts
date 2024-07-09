import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FontAwesomeModule,
  FaIconLibrary,
  SizeProp,
} from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { IconType } from '@config/commonTypes';

@Component({
  selector: 'app-ledger-icon',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './ledger-icon.component.html',
  styleUrl: './ledger-icon.component.scss',
})
export class LedgerIconComponent {
  @Input() type: IconType = IconType.NORMAL;
  @Input() iconName = 'bag-shopping';
  @Input() iconSize: SizeProp = '1x';

  constructor(library: FaIconLibrary) {
    // Add all icons from the solid, regular, and brands styles to the library
    library.addIconPacks(fas, fab);
  }

  get iconPrefix() {
    if (this.type === IconType.BRAND) return 'fab';
    else return 'fas';
  }
}
