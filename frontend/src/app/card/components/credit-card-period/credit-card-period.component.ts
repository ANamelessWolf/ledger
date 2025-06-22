import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {FormsModule} from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-credit-card-period',
  standalone: true,
  imports: [
    MatCommonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './credit-card-period.component.html',
  styleUrl: './credit-card-period.component.scss',
})
export class CreditCardPeriodComponent {
  @Input() walletGroupId = 0;
}
