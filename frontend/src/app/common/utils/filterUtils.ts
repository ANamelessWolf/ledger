import { Pagination, SliderRange, SortType } from '@config/commonTypes';
import { DateRange } from '@expense/types/expensesTypes';
import { isValidDate } from './dateUtils';

export class QueryBuilder {
  /**
   * The query string being built.
   * @private
   */
  private query: string = '';
  /**
   * A flag that indicates the query has set
   * sorting url parameters
   * @private
   */
  private hasSorting: boolean = false;
  /**
   * A flag that indicates the query has set
   * pagination url parameters
   * @private
   */
  private hasPagination: boolean = false;

  /**
   * Returns the current query string.
   * @returns {string} The current query string.
   */
  get queryAsString(): string {
    return this.query;
  }

  /**
   * Adds pagination parameters to the query string.
   * @param {Pagination} pagination - The pagination object containing
   * the page number and page size.
   */
  public addPagination(pagination: Pagination): void {
    if (!this.hasPagination) {
      this.hasPagination = true;
      if (pagination.page) {
        this.query += `page=${pagination.page}`;
      } else {
        this.query += 'page=1';
      }

      if (pagination.pageSize) {
        this.query += `&pageSize=${pagination.pageSize}`;
      } else {
        this.query += `&pageSize=10`;
      }
    } else {
      throw new Error('Pagination was already added to the query');
    }
  }

  /**
   * Adds sorting parameters to the query string.
   * @param {SortType} [sorting] - The sorting object containing the field
   * to sort by and the direction ('ASC' or 'DESC').
   */
  public addSorting(sorting?: SortType): void {
    if (!this.hasSorting) {
      if (sorting && sorting.orderBy) {
        this.query += `&orderBy=${sorting.orderBy}`;
        if (sorting.orderDirection) {
          this.query += `&orderDirection=${sorting.orderDirection}`;
        } else {
          this.query += '&orderDirection=ASC';
        }
      }
    } else {
      throw new Error('Sorting was already added to the query');
    }
  }

  /**
   * Appends a filter property represented by an array to the query string.
   * The array values are joined with commas and added to the query string.
   * @param {string} urlParam - The name of the URL parameter.
   * @param {any[]} [filterProp] - The array of filter values to append to
   * the query string.
   */
  public appendArrFilterProp(
    urlParam: string,
    filterProp: any[] | undefined
  ): void {
    if (filterProp && filterProp.length > 0) {
      const filterValue = filterProp.join(',');
      this.query += `&${urlParam}=${filterValue}`;
    }
  }

  /**
   * Appends a single filter property to the query string.
   * @param {string} urlParam - The name of the URL parameter.
   * @param {any} [filterProp] - The filter value to append to the query string.
   */
  public appendFilterProperty(
    urlParam: string,
    filterProp: any | undefined
  ): void {
    if (filterProp !== undefined && filterProp !== null) {
      this.query += `&${urlParam}=${filterProp}`;
    }
  }

  /**
   * Appends a single date range filter to the query string.
   * On the query start and end parameters are added
   * @param {DateRange} [dateRange] - The date filter range
   */
  public appendDateFilter(dateRange?: DateRange): void {
    if (
      dateRange &&
      isValidDate(dateRange.start) &&
      isValidDate(dateRange.end)
    ) {
      this.query += `&start=${dateRange.start.toISOString()}`;
      this.query += `&end=${dateRange.end.toISOString()}`;
    }
  }

  /**
   * Appends a single value range filter to the query string.
   * On the query min and max parameters are added
   * @param {SliderRange} [valueRange] - The date filter range
   */
  public appendRangeFilter(valueRange?: SliderRange): void {
    if (valueRange) {
      this.query += `&min=${valueRange.min}`;
      this.query += `&max=${valueRange.max}`;
    }
  }
}
