import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MaskCurrencyPipe } from '@common/pipes/mask-currency.pipe';
import {
  CreditCardSummary,
  EMPTY_CREDIT_CARD_SUMMARY,
} from '@common/types/creditCardSummary';
import { CardMiniatureComponent } from '@card/components/card-miniature/card-miniature.component';
import { CommonModule } from '@angular/common';
import { CreditCardChartComponent } from '../credit-card-chart/credit-card-chart.component';

const CARD_NATURAL_W = 360;
const CARD_NATURAL_H = 218;
const CARD_HEIGHT_RATIO = 0.9;

@Component({
  selector: 'app-credit-card-overview',
  standalone: true,
  imports: [CommonModule, CardMiniatureComponent, CreditCardChartComponent, MaskCurrencyPipe],
  templateUrl: './credit-card-overview.component.html',
  styleUrl: './credit-card-overview.component.scss',
})
export class CreditCardOverviewComponent implements AfterViewInit, OnDestroy {
  @Input() summary: CreditCardSummary = EMPTY_CREDIT_CARD_SUMMARY;
  @Input() masked = false;
  @ViewChild('infoCol') infoColRef!: ElementRef<HTMLElement>;

  chartSize = '300px';
  cardScale = 1;

  private resizeObserver!: ResizeObserver;

  constructor(private zone: NgZone) {}

  get cardW(): number { return CARD_NATURAL_W * this.cardScale; }
  get cardH(): number { return CARD_NATURAL_H * this.cardScale; }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      const h = entries[0].contentRect.height;
      if (h > 0) {
        this.zone.run(() => {
          this.cardScale = (h * CARD_HEIGHT_RATIO) / CARD_NATURAL_H;
        });
      }
    });
    this.resizeObserver.observe(this.infoColRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  get isPending() {
    return !!(this.summary?.status?.status === 'Pending');
  }

  get daysToPay() {
    try {
      if (this.summary.status) {
        const diff = new Date(this.summary.status.payment.dueDate).getTime() - Date.now();
        return Math.round(diff / (1000 * 3600 * 24));
      }
      return 0;
    } catch {
      return 0;
    }
  }

  get cutDate() {
    try { return this.summary.status?.cutDate ?? ''; }
    catch { return ''; }
  }

  get dueDate() {
    try { return this.summary.status?.dueDate ?? ''; }
    catch { return ''; }
  }
}
