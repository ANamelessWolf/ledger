import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = '$'): string {
    if (value == null || isNaN(value)) return `0.00 ${currency}`;
    const rounded = Math.round(value * 100) / 100;
    const formatted = rounded.toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${currency}`;
  }
}
