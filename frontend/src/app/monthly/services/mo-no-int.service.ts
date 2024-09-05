import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  MoNoIntFilter,
  MoNoIntSearchOptions,
} from '@moNoInt/types/monthlyNoInterest';
import { LEDGER_API } from '@config/constants';
import { Pagination, SortType } from '@config/commonTypes';
import {
  QueryBuilder,
} from '@common/utils/filterUtils';

@Injectable({
  providedIn: 'root',
})
export class MoNoIntService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  getNonIntMonthlyInstallments(options: MoNoIntSearchOptions): Observable<any> {
    const { pagination, sorting, filter } = options;
    const query = this.getQueryString(pagination, filter, sorting);
    return this.http.get(`${LEDGER_API.MO_NO_INT}?${query}`);
  }

  private getQueryString = (
    pagination: Pagination,
    filter: MoNoIntFilter,
    sorting?: SortType
  ): string => {
    const query = new QueryBuilder();

    // Pagination
    query.addPagination(pagination);

    // Filter
    query.appendArrFilterProp('creditcardId', filter.creditCard);
    query.appendFilterProperty('archived', filter.archived);

    // Sorting
    query.addSorting(sorting);
    return query.queryAsString;
  };
}
