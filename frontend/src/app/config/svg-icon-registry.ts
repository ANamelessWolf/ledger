export interface SvgIconEntry {
  name: string;   // path relative to assets/icons/, without .svg (e.g. "payment/visa_logo")
  category: string;
}

export const SVG_ICON_REGISTRY: SvgIconEntry[] = [
  { name: 'entertainment/utensils',              category: 'Entertainment' },
  { name: 'finance/coins',        category: 'Finance' },
  { name: 'finance/money-transfer',        category: 'Finance' },
  { name: 'health/tooth',   category: 'Health' },
  { name: 'health/nutrition',   category: 'Health' },
  { name: 'health/assurance',   category: 'Health' },
  { name: 'payment/visa_logo',       category: 'Payment' },
  { name: 'payment/mastercard-logo', category: 'Payment' },
  { name: 'payment/amex_logo',       category: 'Payment' },
  { name: 'payment/discover_logo',   category: 'Payment' },
  { name: 'payment/default_logo',    category: 'Payment' },
  { name: 'shopping/motorcycle',             category: 'Shopping' },
  { name: 'shopping/shirt',             category: 'Shopping' },
  { name: 'shopping/pump-soap',           category: 'Shopping' },
  { name: 'shopping/clean-bottle',           category: 'Shopping' },
  { name: 'other/cow',               category: 'Other' },

];

export const CUSTOM_SVG_ICON_NAMES = new Set<string>(SVG_ICON_REGISTRY.map(e => e.name));
