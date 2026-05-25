export type CatalogFieldType = 'text' | 'number' | 'icon' | 'textarea';

export interface CatalogColumn {
  field: string;
  header: string;
  type?: CatalogFieldType;
  sortable?: boolean;
  width?: string;
  readonly?: boolean;
}

export interface CatalogFormField {
  field: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export type CatalogViewMode = 'table' | 'cards';

export interface CatalogConfig {
  title: string;
  icon: string;
  apiPath: string;
  labelField: string;
  columns: CatalogColumn[];
  formFields: CatalogFormField[];
  allowDelete?: boolean;
  viewMode?: CatalogViewMode;
  searchPlaceholder?: string;
}

export const CATALOG_CONFIGS: Record<string, CatalogConfig> = {
  'expense-types': {
    title: 'Expense Types',
    icon: 'category',
    apiPath: 'expense-types',
    labelField: 'description',
    columns: [
      { field: 'id',          header: 'ID',          type: 'number', width: '60px', readonly: true },
      { field: 'icon',        header: 'Icon',        type: 'icon',   width: '64px' },
      { field: 'description', header: 'Description', type: 'text',   sortable: true },
    ],
    formFields: [
      { field: 'description', label: 'Description', type: 'text', required: true, maxLength: 100, placeholder: 'e.g. Groceries' },
      { field: 'icon',        label: 'Icon',        type: 'icon', required: true  },
    ],
    allowDelete: true,
    searchPlaceholder: 'Search expense types…',
  },
  'financing-types': {
    title: 'Financing Types',
    icon: 'account_balance',
    apiPath: 'financing-types',
    labelField: 'description',
    columns: [
      { field: 'id',          header: 'ID',          type: 'number', width: '60px', readonly: true },
      { field: 'description', header: 'Description', type: 'text',   sortable: true },
    ],
    formFields: [
      { field: 'description', label: 'Description', type: 'text', required: true, maxLength: 100, placeholder: 'e.g. Personal loan' },
    ],
    allowDelete: true,
    searchPlaceholder: 'Search financing types…',
  },
  'vendors': {
    title: 'Vendors',
    icon: 'store',
    apiPath: 'vendors',
    labelField: 'description',
    columns: [
      { field: 'id',          header: 'ID',   type: 'number', width: '60px', readonly: true },
      { field: 'description', header: 'Name', type: 'text',   sortable: true },
    ],
    formFields: [
      { field: 'description', label: 'Name', type: 'text', required: true, maxLength: 45, placeholder: 'e.g. Amazon' },
    ],
    allowDelete: true,
    searchPlaceholder: 'Search vendors…',
  },
  'wallet-types': {
    title: 'Wallet Types',
    icon: 'wallet',
    apiPath: 'wallet-types',
    labelField: 'description',
    columns: [
      { field: 'id',          header: 'ID',   type: 'number', width: '60px', readonly: true },
      { field: 'description', header: 'Name', type: 'text',   sortable: true },
    ],
    formFields: [
      { field: 'description', label: 'Name', type: 'text', required: true, maxLength: 40, placeholder: 'e.g. Checking account' },
    ],
    allowDelete: true,
    searchPlaceholder: 'Search wallet types…',
  },
};

export const SETTINGS_SECTIONS = [
  {
    label: 'Catalogs',
    items: [
      { id: 'expense-types',   label: 'Expense Types',    icon: 'category'        },
      { id: 'financing-types', label: 'Financing Types',  icon: 'account_balance' },
      { id: 'vendors',         label: 'Vendors',          icon: 'store'           },
      { id: 'wallet-types',    label: 'Wallet Types',     icon: 'wallet'          },
    ],
  },
];
