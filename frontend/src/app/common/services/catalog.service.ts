import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CardFilter } from '@common/types/cardItem';
import { LEDGER_API } from '@config/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(private http: HttpClient) {}

  getCards(filter: CardFilter | undefined): Observable<any> {
    let query = '';
    if (filter !== undefined && filter.entityId > 0) {
      query += `entityId=${filter.entityId}`;
    }
    if (filter !== undefined && filter.crediCardType < 2) {
      query += query.length > 0 ? '&' : '';
      query += `isCreditCard=${filter.crediCardType}`;
    }
    if (filter !== undefined && filter.active <= 2) {
      query += query.length > 0 ? '&' : '';
      query += `active=${filter.active}`;
    }
    let end_point = `${LEDGER_API.CATALOG}/cards`;
    if (query.length > 0) {
      end_point += `?${query}`;
    }
    return this.http.get(end_point);
  }

  getFinancingEntities(): Observable<any> {
    return this.http.get(`${LEDGER_API.CATALOG}/financing_entities`);
  }
}
