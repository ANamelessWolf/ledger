import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-miniature',
  standalone: true,
  imports: [],
  templateUrl: './card-miniature.component.html',
  styleUrl: './card-miniature.component.scss'
})
export class CardMiniatureComponent {

  @Input() color = 'white';
  @Input() banking:String = '';
  @Input() expiration:String = '';
  @Input() ending:String = '';

  get endingCard(): string {
    if (this.banking === 'American Express') {
      return `XXXX XXXXXX ${this.ending}`;
    }
    return `XXXX XXXX XXXX ${this.ending}`;
  }

}
