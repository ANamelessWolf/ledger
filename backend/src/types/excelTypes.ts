import { Expense } from "../models/expenses";

export type ExcelTableMapping = {
  idColumn: string;
  valueColumn: string;
};

export type ExcelCatalogRow = {
  id: string;
  value: string;
};

export type ExcelExpenseRow = {
  Wallet: string;
  ExpenseType: string;
  Vendor: string;
  Total: string;
  Currency: string;
  CurrencyFactor: string;
  Date: number;
  Description: string;
};

export type ExpenseRow = {
  wallet_id: number;
  wallet_group_id: number;
  expense_type_id: number;
  vendor_id: number;
  currency_id: number;
  description: string;
  total: number;
  buy_date: string;
};

export type FailedExpenseRow = {
  data: ExpenseRow;
  error: string;
};

export type UploadResult = {
  succed: Expense[];
  failed: FailedExpenseRow[];
};

export const EXPENSE_TYPE_COLUMN_MAPPING: ExcelTableMapping = {
  idColumn: "A",
  valueColumn: "B",
};

export const EXPENSE_WALLET_COLUMN_MAPPING: ExcelTableMapping = {
  idColumn: "D",
  valueColumn: "E",
};

export const EXPENSE_VENDOR_COLUMN_MAPPING: ExcelTableMapping = {
  idColumn: "G",
  valueColumn: "H",
};

export const EXPENSE_CURRENCY_COLUMN_MAPPING: ExcelTableMapping = {
  idColumn: "J",
  valueColumn: "K",
};

export const CATALOG_SHEET = "Catalog";
export const EXPENSES_SHEET = "Expenses";
