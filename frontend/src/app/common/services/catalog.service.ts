import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LEDGER_API } from '@config/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(private http: HttpClient) {}

  getCards(): Observable<any> {
    return this.http.get(`${LEDGER_API.CATALOG}/cards`);
  }
}
