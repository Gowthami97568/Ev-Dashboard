import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DeviceRecord {
  [key: string]: unknown;
}

export interface DeviceSummary {
  total: number;
}

export interface DeviceSummaryResponse {
  success: boolean;
  message: string;
  data: DeviceSummary;
}

export interface DeviceColumnsResponse {
  success: boolean;
  message: string;
  data: {
    columns: string[];
  };
}

export interface DeviceListData {
  items: DeviceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeviceListResponse {
  success: boolean;
  message: string;
  data: DeviceListData;
}

export interface DeviceResponse {
  success: boolean;
  message: string;
  data: DeviceRecord;
}

@Injectable({
  providedIn: 'root'
})
export class DevicesMasterService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/devices-master`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getSummary(): Observable<DeviceSummaryResponse> {
    return this.http.get<DeviceSummaryResponse>(
      `${this.apiUrl}/summary`
    );
  }

  getColumns(): Observable<DeviceColumnsResponse> {
    return this.http.get<DeviceColumnsResponse>(
      `${this.apiUrl}/columns`
    );
  }

  getDevices(
    page = 1,
    limit = 10,
    search = ''
  ): Observable<DeviceListResponse> {

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<DeviceListResponse>(
      this.apiUrl,
      { params }
    );
  }

  getDevice(
    id: string
  ): Observable<DeviceResponse> {

    return this.http.get<DeviceResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    );
  }
}