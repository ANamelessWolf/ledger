import { Pipe, PipeTransform } from '@angular/core';
import { toCurrency } from '@common/utils/formatUtils';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null || isNaN(value)) {
      return 'MXN 0.00';
    }
    return toCurrency(value);
  }

}
