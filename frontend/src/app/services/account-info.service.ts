import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccountInfoRecord {
  [key: string]: unknown;
}

export interface AccountInfoSummary {
  total: number;
}

export interface AccountInfoSummaryResponse {
  success: boolean;
  message: string;
  data: AccountInfoSummary;
}

export interface AccountInfoColumnsResponse {
  success: boolean;
  message: string;
  data: {
    columns: string[];
  };
}

export interface AccountInfoListData {
  items: AccountInfoRecord[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountInfoListResponse {
  success: boolean;
  message: string;
  data: AccountInfoListData;
}

@Injectable({
  providedIn: 'root'
})
export class AccountInfoService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/account-info`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getSummary():
    Observable<AccountInfoSummaryResponse> {

    return this.http.get<AccountInfoSummaryResponse>(
      `${this.apiUrl}/summary`
    );
  }

  getColumns():
    Observable<AccountInfoColumnsResponse> {

    return this.http.get<AccountInfoColumnsResponse>(
      `${this.apiUrl}/columns`
    );
  }

  getAccountInfo(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<AccountInfoListResponse> {

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<AccountInfoListResponse>(
      this.apiUrl,
      { params }
    );
  }
}