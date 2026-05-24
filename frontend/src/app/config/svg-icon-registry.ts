export interface SvgIconEntry {
  name: string;   // path relative to assets/icons/, without .svg (e.g. "payment/visa_logo")
  category: string;
}

export const SVG_ICON_REGISTRY: SvgIconEntry[] = [
  // ── Payment ──────────────────────────────────────────────────────────────
  { name: 'payment/visa_logo',       category: 'Payment' },
  { name: 'payment/mastercard-logo', category: 'Payment' },
  { name: 'payment/amex_logo',       category: 'Payment' },
  { name: 'payment/discover_logo',   category: 'Payment' },
  { name: 'payment/default_logo',    category: 'Payment' },
  // ── Other ─────────────────────────────────────────────────────────────────
  { name: 'other/cow',               category: 'Other' },
];

export const CUSTOM_SVG_ICON_NAMES = new Set<string>(SVG_ICON_REGISTRY.map(e => e.name));
