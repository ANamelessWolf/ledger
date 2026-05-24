import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LEDGER_API_URL } from '@config/constants';

const BASE = `${LEDGER_API_URL}/settings`;

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private http: HttpClient) {}

  getAll(apiPath: string): Observable<any> {
    return this.http.get(`${BASE}/${apiPath}`);
  }

  create(apiPath: string, data: any): Observable<any> {
    return this.http.post(`${BASE}/${apiPath}`, data);
  }

  update(apiPath: string, id: number, data: any): Observable<any> {
    return this.http.put(`${BASE}/${apiPath}/${id}`, data);
  }

  delete(apiPath: string, id: number): Observable<any> {
    return this.http.delete(`${BASE}/${apiPath}/${id}`);
  }
}
