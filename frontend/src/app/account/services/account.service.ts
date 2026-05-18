import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LEDGER_API } from '@config/constants';
import {
  CreateAccountPayload,
  CreateSectionPayload,
  UpdateAccountPayload,
} from '../types/account.types';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any> {
    return this.http.get(`${LEDGER_API.ACCOUNTS}`);
  }

  getAccountById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.ACCOUNTS}/${id}`);
  }

  createAccount(payload: CreateAccountPayload): Observable<any> {
    return this.http.post(`${LEDGER_API.ACCOUNTS}`, payload);
  }

  updateAccount(id: number, payload: UpdateAccountPayload): Observable<any> {
    return this.http.put(`${LEDGER_API.ACCOUNTS}/${id}`, payload);
  }

  getPreferredWallet(groupId: number, currencyId: number): Observable<any> {
    return this.http.get(`${LEDGER_API.ACCOUNTS}/wallet/${groupId}/${currencyId}`);
  }

  createSection(accountId: number, payload: CreateSectionPayload): Observable<any> {
    return this.http.post(`${LEDGER_API.ACCOUNTS}/${accountId}/sections`, payload);
  }

  updateSection(sectionId: number, payload: CreateSectionPayload): Observable<any> {
    return this.http.put(`${LEDGER_API.ACCOUNTS}/sections/${sectionId}`, payload);
  }

  deleteSection(sectionId: number): Observable<any> {
    return this.http.delete(`${LEDGER_API.ACCOUNTS}/sections/${sectionId}`);
  }
}
