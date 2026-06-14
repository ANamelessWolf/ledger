export interface ExpenseGroup {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface SaveExpenseGroup {
  name: string;
  description?: string | null;
  icon?: string | null;
}
