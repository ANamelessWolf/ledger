export type CatalogFieldType = 'text' | 'number' | 'icon' | 'textarea' | 'select';

export interface CatalogColumn {
  field: string;
  header: string;
  type?: CatalogFieldType;
  sortable?: boolean;
  width?: string;
  readonly?: boolean;
  optionsPath?: string;
  optionValue?: string;
  optionLabel?: string;
}

export interface CatalogFormField {
  field: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  optionsPath?: string;
  optionValue?: string;
  optionLabel?: string;
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
    searchPlaceholder: 'Search',
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
    searchPlaceholder: 'Search',
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
    searchPlaceholder: 'Search',
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
    searchPlaceholder: 'Search',
  },
  'financing-entities': {
    title: 'Financing Entities',
    icon: 'corporate_fare',
    apiPath: 'financing-entities',
    labelField: 'name',
    columns: [
      { field: 'id',              header: 'ID',              type: 'number', width: '60px',  readonly: true },
      { field: 'name',            header: 'Name',            type: 'text',   sortable: true },
      { field: 'financingTypeId', header: 'Financing Type',  type: 'select', width: '180px',
        optionsPath: 'financing-types', optionValue: 'id', optionLabel: 'description' },
    ],
    formFields: [
      { field: 'name',            label: 'Name',           type: 'text',   required: true, maxLength: 20, placeholder: 'e.g. BBVA' },
      { field: 'financingTypeId', label: 'Financing Type', type: 'select', required: true,
        optionsPath: 'financing-types', optionValue: 'id', optionLabel: 'description' },
    ],
    allowDelete: true,
    searchPlaceholder: 'Search',
  },
};

export const SETTINGS_SECTIONS = [
  {
    label: 'Catalogs',
    items: [
      { id: 'expense-types',        label: 'Expense Types',       icon: 'category'        },
      { id: 'financing-types',      label: 'Financing Types',     icon: 'account_balance' },
      { id: 'financing-entities',   label: 'Financing Entities',  icon: 'corporate_fare'  },
      { id: 'vendors',              label: 'Vendors',             icon: 'store'           },
      { id: 'wallet-types',         label: 'Wallet Types',        icon: 'wallet'          },
    ],
  },
];
