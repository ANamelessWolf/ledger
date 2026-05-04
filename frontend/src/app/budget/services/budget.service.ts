import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LEDGER_API } from '@config/constants';
import { AddBudget, AddBudgetItem, BudgetFormData, BudgetItemsFormData, UpdateBudget } from '@budget/types/budgetTypes';
import { Observable } from 'rxjs';
import { BudgetFormComponent } from '@budget/components/budget-form/budget-form.component';
import { BudgetItemsFormComponent } from '@budget/components/budget-items-form/budget-items-form.component';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  getBudgetsByOwnerId(ownerId: number = 1): Observable<any> {
    return this.http.get(`${LEDGER_API.BUDGET}?ownerId=${ownerId}`);
  }

  getBudgetById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.BUDGET}/${id}`);
  }

  createBudget(body: AddBudget): Observable<any> {
    return this.http.post(`${LEDGER_API.BUDGET}`, body);
  }

  updateBudget(id: number, body: UpdateBudget): Observable<any> {
    return this.http.put(`${LEDGER_API.BUDGET}/${id}`, body);
  }

  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.BUDGET}/${id}`);
  }

  getBudgetItems(budgetId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.BUDGET}/${budgetId}/items`);
  }

  addBudgetItem(budgetId: number, body: AddBudgetItem): Observable<any> {
    return this.http.post(`${LEDGER_API.BUDGET}/${budgetId}/items`, body);
  }

  removeBudgetItem(budgetId: number, itemId: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.BUDGET}/${budgetId}/items/${itemId}`);
  }

  getWeekSummary(ownerId: number = 1, start?: string, end?: string): Observable<any> {
    let url = `${LEDGER_API.BUDGET}/summary/week?ownerId=${ownerId}`;
    if (start && end) url += `&start=${start}&end=${end}`;
    return this.http.get(url);
  }

  getMonthSummary(ownerId: number = 1, start?: string, end?: string): Observable<any> {
    let url = `${LEDGER_API.BUDGET}/summary/month?ownerId=${ownerId}`;
    if (start && end) url += `&start=${start}&end=${end}`;
    return this.http.get(url);
  }

  getYearSummary(ownerId: number = 1, start?: string, end?: string): Observable<any> {
    let url = `${LEDGER_API.BUDGET}/summary/year?ownerId=${ownerId}`;
    if (start && end) url += `&start=${start}&end=${end}`;
    return this.http.get(url);
  }

  showBudgetFormDialog(data: BudgetFormData) {
    const dialogRef = this.dialog.open(BudgetFormComponent, {
      width: '500px',
      data,
    });
    return dialogRef.afterClosed();
  }

  showBudgetItemsFormDialog(data: BudgetItemsFormData) {
    const dialogRef = this.dialog.open(BudgetItemsFormComponent, {
      width: '700px',
      maxHeight: '60vh',
      position: { top: '20vh' },
      data,
    });
    return dialogRef.afterClosed();
  }

}
