import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LEDGER_API } from '@config/constants';
import { ExpenseGroup, SaveExpenseGroup } from '@expense/types/expenseGroupTypes';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpenseGroupsService {
  constructor(private http: HttpClient) {}

  getGroups(): Observable<any> {
    return this.http.get(LEDGER_API.EXPENSE_GROUPS);
  }

  createGroup(body: SaveExpenseGroup): Observable<any> {
    return this.http.post(LEDGER_API.EXPENSE_GROUPS, body);
  }

  updateGroup(id: number, body: SaveExpenseGroup): Observable<any> {
    return this.http.put(`${LEDGER_API.EXPENSE_GROUPS}/${id}`, body);
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.EXPENSE_GROUPS}/${id}`);
  }

  getGroupExpenses(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.EXPENSE_GROUPS}/${id}/expenses`);
  }

  addExpenseToGroup(groupId: number, expenseId: number): Observable<any> {
    return this.http.post(`${LEDGER_API.EXPENSE_GROUPS}/${groupId}/expenses`, { expenseId });
  }

  removeExpenseFromGroup(groupId: number, expenseId: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.EXPENSE_GROUPS}/${groupId}/expenses/${expenseId}`);
  }
}
