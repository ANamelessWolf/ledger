export interface SvgIconEntry {
  name: string;   // path relative to assets/icons/, without .svg (e.g. "payment/visa_logo")
  category: string;
}

export const SVG_ICON_REGISTRY: SvgIconEntry[] = [
  { name: 'entertainment/utensils',              category: 'Entertainment' },
  { name: 'entertainment/spa',              category: 'Entertainment' },
  { name: 'entertainment/art',              category: 'Entertainment' },
  { name: 'entertainment/person-hiking',              category: 'Entertainment' },
  { name: 'entertainment/baseball',              category: 'Entertainment' },
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
  { name: 'shopping/bottle-water',           category: 'Shopping' },
  { name: 'shopping/leanpub',           category: 'Shopping' },
  { name: 'shopping/candy-cane',              category: 'shopping' },
  { name: 'other/cow',               category: 'Other' },

];

export const CUSTOM_SVG_ICON_NAMES = new Set<string>(SVG_ICON_REGISTRY.map(e => e.name));
