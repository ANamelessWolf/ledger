import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LEDGER_API } from '@config/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient) {}

  getCreditCardSummaryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.CREDIT_CARD}/summary/${id}`);
  }

  getDebitCardSummaryById(id: number): Observable<any> {
    return this.http.get(`${LEDGER_API.DEBIT_CARD}/summary/${id}`);
  }
}
