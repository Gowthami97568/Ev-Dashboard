import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SocketInfoRecord {
  [key: string]: unknown;
}

export interface SocketInfoSummary {
  total: number;
}

export interface SocketInfoSummaryResponse {
  success: boolean;
  message: string;
  data: SocketInfoSummary;
}

export interface SocketInfoColumnsResponse {
  success: boolean;
  message: string;
  data: {
    columns: string[];
  };
}

export interface SocketInfoListData {
  items: SocketInfoRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SocketInfoListResponse {
  success: boolean;
  message: string;
  data: SocketInfoListData;
}

@Injectable({
  providedIn: 'root'
})
export class SocketInfoService {

  private readonly apiUrl =
    'http://localhost:5000/api/socket-info';

  constructor(
    private readonly http: HttpClient
  ) {}

  getSummary(): Observable<SocketInfoSummaryResponse> {
    return this.http.get<SocketInfoSummaryResponse>(
      `${this.apiUrl}/summary`
    );
  }

  getColumns(): Observable<SocketInfoColumnsResponse> {
    return this.http.get<SocketInfoColumnsResponse>(
      `${this.apiUrl}/columns`
    );
  }

  getSocketInfo(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<SocketInfoListResponse> {

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<SocketInfoListResponse>(
      this.apiUrl,
      { params }
    );
  }
}