import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LedgerIconComponent } from '../ledger-icon/ledger-icon.component';
import { MATERIAL_ICONS, IconEntry } from '../../../settings/components/icon-picker/icon-picker.component';
import { SVG_ICON_REGISTRY } from '@config/svg-icon-registry';

const SVG_ICONS: IconEntry[] = SVG_ICON_REGISTRY.map(e => ({ ...e, type: 'svg' as const }));

const ALL_ICONS_DEDUPED: IconEntry[] = (() => {
  const seen = new Set<string>();
  return [...SVG_ICONS, ...MATERIAL_ICONS].filter(i => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  });
})();

@Component({
  selector: 'app-icon-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, OverlayModule, LedgerIconComponent],
  templateUrl: './icon-select.component.html',
  styleUrl: './icon-select.component.scss',
})
export class IconSelectComponent implements OnInit, OnDestroy {
  @Input() control: FormControl = new FormControl('');
  @ViewChild('panelTpl') panelTpl!: TemplateRef<unknown>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');
  filteredIcons: IconEntry[] = ALL_ICONS_DEDUPED;
  isOpen = false;

  private overlayRef!: OverlayRef;
  private destroy$ = new Subject<void>();

  @HostBinding('style.display') display = 'block';

  constructor(
    private overlay: Overlay,
    private vcr: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(q => this.applyFilter(q ?? ''));
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedIcon(): string {
    return this.control.value ?? '';
  }

  toggle(event: MouseEvent): void {
    this.isOpen ? this.close() : this.open(event.currentTarget as HTMLElement);
  }

  open(triggerEl: HTMLElement): void {
    const rect = triggerEl.getBoundingClientRect();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerEl)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: rect.width,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef.attach(new TemplatePortal(this.panelTpl, this.vcr));
    this.overlayRef.backdropClick().pipe(takeUntil(this.destroy$)).subscribe(() => this.close());
    this.isOpen = true;

    setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
  }

  close(): void {
    this.overlayRef?.detach();
    this.isOpen = false;
    this.searchControl.setValue('');
  }

  pick(name: string): void {
    this.control.setValue(name);
    this.close();
  }

  private applyFilter(q: string): void {
    const query = q.toLowerCase();
    this.filteredIcons = query
      ? ALL_ICONS_DEDUPED.filter(i =>
          i.name.includes(query) || i.category.toLowerCase().includes(query)
        )
      : ALL_ICONS_DEDUPED;
  }
}
