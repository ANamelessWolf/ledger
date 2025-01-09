import fs from "fs";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import {
  CATALOG_SHEET,
  ExcelCatalogRow,
  ExcelExpenseRow,
  ExcelTableMapping,
  EXPENSE_CURRENCY_COLUMN_MAPPING,
  EXPENSE_TYPE_COLUMN_MAPPING,
  EXPENSE_VENDOR_COLUMN_MAPPING,
  EXPENSE_WALLET_COLUMN_MAPPING,
  ExpenseRow,
  EXPENSES_SHEET,
} from "../types/excelTypes";
import { WalletList } from "../models/ledger";

/**
 * Class to handle uploading and processing expense data from an Excel file.
 */
export class ExcelExpenseUploader {
  private excelPath: string;
  private wallets: WalletList[];
  expensesTypeDict: Record<string, string> = {};
  walletDict: Record<string, string> = {};
  vendorDict: Record<string, string> = {};
  currencyDict: Record<string, string> = {};

  /**
   * Initializes a new instance of the ExcelExpenseUploader class.
   * @param excelPath - The path to the Excel file containing expense data.
   * @param wallets - The database available wallets.
   */
  constructor(excelPath: string, wallets: WalletList[]) {
    this.excelPath = excelPath;
    this.wallets = wallets;
  }

  /**
   * Normalizes the keys in an array of objects by removing whitespace.
   * @param data - The array of objects to normalize.
   * @returns A new array with normalized keys.
   */
  private normalizeKeys(data: any[]): ExcelExpenseRow[] {
    return data.map((item) => {
      const normalizedItem: Record<string, any> = {};
      Object.keys(item).forEach((key) => {
        const normalizedKey = key.replace(/\s+/g, "").trim();
        normalizedItem[normalizedKey] = item[key];
      });
      return normalizedItem as ExcelExpenseRow;
    });
  }

  /**
   * Gets a wallet id, by selecting a wallet group and a currencyId
   * @param walletGroupId - The wallet group id
   * @param currencyId - The currency id
   * @returns The wallet id if found or a 0 if not.
   */
  private getWalletId(walletGroupId: number, currencyId: number): number {
    const filtered = this.wallets.filter(
      (wallet) =>
        wallet.currencyId === currencyId &&
        wallet.walletGroupId === walletGroupId
    );
    return filtered.length > 0 ? filtered[0].walletId : 0;
  }

  /**
   * Extracts a table from the catalog sheet based on column locations.
   * @param data - The catalog data in a 2D array format.
   * @param idColumn - The column letter for the ID column.
   * @param valueColumn - The column letter for the value column.
   * @returns An array of objects containing ID and value pairs.
   */
  private extractTable(
    data: any[][],
    mapping: ExcelTableMapping
  ): ExcelCatalogRow[] {
    const idIndex = XLSX.utils.decode_col(mapping.idColumn);
    const valueIndex = XLSX.utils.decode_col(mapping.valueColumn);

    const table: { id: string; value: string }[] = [];
    for (let i = 1; i < data.length; i++) {
      const id = data[i]?.[idIndex];
      const value = data[i]?.[valueIndex];
      if (id && value) {
        table.push({ id: String(id), value: String(value) });
      }
    }
    return table;
  }

  /**
   * Creates a dictionary from a table with IDs and values.
   * @param table - An array of objects containing ID and value pairs.
   * @returns A dictionary where keys are values, and values are IDs.
   */
  private createDictionary(
    table: { id: string; value: string }[]
  ): Record<string, string> {
    return table.reduce((dict, row) => {
      dict[row.value] = row.id;
      return dict;
    }, {} as Record<string, string>);
  }

  /**
   * Converts an Excel date to a JavaScript date and formats it as YYYY-MM-DD.
   * @param serial - The serial number representing the Excel date.
   * @returns A formatted date string.
   */
  private excelDateToJSDate(serial: number): string {
    const jsDate = new Date((serial - 25569) * 86400 * 1000);
    return format(jsDate, "yyyy-MM-dd");
  }

  /**
   * Initialize the catalogs
   * @param catalogSheet - The Excel catalog sheet.
   */
  private initCatalogs(catalogSheet: XLSX.WorkSheet) {
    // Convert the Catalog sheet to JSON
    const catalogData = XLSX.utils.sheet_to_json<any>(catalogSheet, {
      header: 1,
    });

    // Extract tables
    const expensesTypeTable = this.extractTable(
      catalogData,
      EXPENSE_TYPE_COLUMN_MAPPING
    );
    const walletTable = this.extractTable(
      catalogData,
      EXPENSE_WALLET_COLUMN_MAPPING
    );
    const vendorTable = this.extractTable(
      catalogData,
      EXPENSE_VENDOR_COLUMN_MAPPING
    );
    const currencyTable = this.extractTable(
      catalogData,
      EXPENSE_CURRENCY_COLUMN_MAPPING
    );

    // Create dictionaries
    this.expensesTypeDict = this.createDictionary(expensesTypeTable);
    this.walletDict = this.createDictionary(walletTable);
    this.vendorDict = this.createDictionary(vendorTable);
    this.currencyDict = this.createDictionary(currencyTable);
  }

  /**
   * Gets the expenses data from the expense sheet.
   * @param expensesSheet - The Excel expense sheet.
   * @returns The expense list
   */
  private getExpenses(expensesSheet: XLSX.WorkSheet): ExpenseRow[] {
    // Normalize and process expenses data
    const expensesData = XLSX.utils.sheet_to_json(expensesSheet);
    const normalizedExpensesData: ExcelExpenseRow[] =
      this.normalizeKeys(expensesData);

    // Convert data to desired format
    const data = normalizedExpensesData.map((expense: ExcelExpenseRow) => ({
      wallet_id: this.getWalletId(
        +this.walletDict[expense.Wallet],
        +this.currencyDict[expense.Currency]
      ),
      wallet_group_id: +this.walletDict[expense.Wallet],
      expense_type_id: +this.expensesTypeDict[expense.ExpenseType],
      vendor_id: +this.vendorDict[expense.Vendor],
      currency_id: +this.currencyDict[expense.Currency],
      description: expense.Description,
      total: parseFloat(expense.Total),
      buy_date: this.excelDateToJSDate(expense.Date),
    }));

    return data;
  }

  /**
   * Processes the Excel file to extract and format expense data.
   * @returns An array of formatted expense data.
   * @throws An error if the file or required sheets are missing.
   */
  public process(): ExpenseRow[] {
    if (!fs.existsSync(this.excelPath)) {
      throw new Error("Excel file not found.");
    }

    // Read the Excel file
    const workbook = XLSX.readFile(this.excelPath);

    // Read specific sheets
    const expensesSheet = workbook.Sheets[EXPENSES_SHEET];
    const catalogSheet = workbook.Sheets[CATALOG_SHEET];

    if (!catalogSheet || !expensesSheet) {
      throw new Error("Missing required sheets in the file.");
    }

    // Initialize the catalogs
    this.initCatalogs(catalogSheet);

    // Get the expenses
    const expenses = this.getExpenses(expensesSheet);

    return expenses;
  }
}
