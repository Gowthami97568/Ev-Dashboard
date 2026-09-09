import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppVersionRecord {
  [key: string]: unknown;
}

export interface AppVersionSummary {
  total: number;
}

export interface AppVersionSummaryResponse {
  success: boolean;
  message: string;
  data: AppVersionSummary;
}

export interface AppVersionColumnsResponse {
  success: boolean;
  message: string;
  data: {
    columns: string[];
  };
}

export interface AppVersionListData {
  items: AppVersionRecord[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppVersionListResponse {
  success: boolean;
  message: string;
  data: AppVersionListData;
}

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {

  private readonly apiUrl =
    'http://localhost:5000/api/app-version';

  constructor(
    private readonly http: HttpClient
  ) {}

  getSummary():
    Observable<AppVersionSummaryResponse> {

    return this.http.get<AppVersionSummaryResponse>(
      `${this.apiUrl}/summary`
    );
  }

  getColumns():
    Observable<AppVersionColumnsResponse> {

    return this.http.get<AppVersionColumnsResponse>(
      `${this.apiUrl}/columns`
    );
  }

  getAppVersions(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<AppVersionListResponse> {

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<AppVersionListResponse>(
      this.apiUrl,
      { params }
    );
  }
}