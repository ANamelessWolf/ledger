import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { CurrencyFormatPipe } from '@common/pipes/currency-format.pipe';
import { toCurrency } from '@common/utils/formatUtils';
import { SliderRange } from '@config/commonTypes';
@Component({
  selector: 'app-range-slider',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSliderModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.scss',
})
export class RangeSliderComponent {
  @Input() control: FormControl = new FormControl();
  @Input() header: string = '';
  @Input() isRequired: boolean = false;
  @Input() errMessage: string = 'Field is required.';
  @Input() step: number = 500;
  @Input() matSliderStartThumb: number = 0;
  @Input() matSliderEndThumb: number = 100;

  sliderRange: SliderRange = { min: 0, max: 100 };
  disabled = false;

  ngOnInit(): void {
    if (this.control.value) {
      this.sliderRange = this.control.value;
      this.disabled = true;
    }
  }

  onMinSliderChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.sliderRange.min = Number(inputElement.value);
    this.control.setValue(this.sliderRange);
  }

  onMaxSliderChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.sliderRange.max = Number(inputElement.value);
    this.control.setValue(this.sliderRange);
  }

  displayWith(value: number): string {
    return toCurrency(value);
  }

  reset(): void {
    this.sliderRange.min = 0;
    this.sliderRange.max = 0;
    this.control.setValue(undefined);
    this.disabled = false;
  }
}
