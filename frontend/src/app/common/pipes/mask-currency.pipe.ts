import { Pipe, PipeTransform } from '@angular/core';

const MASKED_VALUE = '$** **.**';

@Pipe({ name: 'maskCurrency', standalone: true, pure: false })
export class MaskCurrencyPipe implements PipeTransform {
  transform(value: string | number, masked: boolean): string {
    if (!masked) return String(value ?? '');
    return MASKED_VALUE;
  }
}
