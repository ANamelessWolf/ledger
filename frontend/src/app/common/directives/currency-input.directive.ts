import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { APP_SETTINGS } from '@config/constants';

@Directive({
  selector: 'input[appCurrencyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true,
    },
  ],
})
export class CurrencyInputDirective implements ControlValueAccessor {
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private rawValue: number | null = null;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null): void {
    this.rawValue = value ?? null;
    this.el.nativeElement.value = value != null ? this.format(value) : '';
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('focus')
  onFocus(): void {
    this.el.nativeElement.value = this.rawValue != null ? String(this.rawValue) : '';
    this.el.nativeElement.select();
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    const inputVal = this.el.nativeElement.value.trim();
    if (inputVal === '') {
      this.rawValue = null;
      this.onChange(null);
    } else {
      const parsed = parseFloat(inputVal);
      this.rawValue = isNaN(parsed) ? null : Math.max(0, Math.round(parsed * 100) / 100);
      this.onChange(this.rawValue);
      this.el.nativeElement.value = this.rawValue != null ? this.format(this.rawValue) : '';
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    let val = input.value.replace(/[^0-9.]/g, '');

    // Keep only first decimal point, limit to 2 decimal places
    const dotIdx = val.indexOf('.');
    if (dotIdx !== -1) {
      val = val.substring(0, dotIdx + 1) + val.substring(dotIdx + 1).replace(/\./g, '').substring(0, 2);
    }

    if (input.value !== val) {
      input.value = val;
    }

    const parsed = val === '' ? null : parseFloat(val);
    this.rawValue = parsed != null && !isNaN(parsed) ? parsed : null;
    this.onChange(this.rawValue);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const passthrough = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (passthrough.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (event.key === '.') {
      if (this.el.nativeElement.value.includes('.')) event.preventDefault();
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private format(value: number): string {
    return new Intl.NumberFormat(APP_SETTINGS.APP_LOCAL, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
