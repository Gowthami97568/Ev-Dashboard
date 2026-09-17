import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// =====================================================
// DEVICE MODEL
// =====================================================

export interface DeviceMasterRecord {
  [key: string]: any;
}


// =====================================================
// LIST RESPONSE
// =====================================================

export interface DeviceListResponse {

  success: boolean;

  message: string;

  data: {

    items: DeviceMasterRecord[];

    pagination: {

      page: number;

      limit: number;

      total: number;

      totalPages: number;

    };

  };

}


// =====================================================
// UPDATE RESPONSE
// =====================================================

export interface DeviceUpdateResponse {

  success: boolean;

  message: string;

  data?: DeviceMasterRecord;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class DevicesMasterService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/devices-master`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // ===================================================
  // GET DEVICES
  // ===================================================

  getDevices(
    page: number,
    limit: number,
    search: string
  ): Observable<DeviceListResponse> {

    let params =
      new HttpParams()

        .set(
          'page',
          String(page)
        )

        .set(
          'limit',
          String(limit)
        );


    if (
      search &&
      search.trim()
    ) {

      params =
        params.set(
          'search',
          search.trim()
        );

    }


    return this.http.get<DeviceListResponse>(
      this.apiUrl,
      {
        params
      }
    );

  }


  // ===================================================
  // UPDATE DEVICE
  // ===================================================

  updateDevice(
    deviceId: string,
    device: DeviceMasterRecord
  ): Observable<DeviceUpdateResponse> {

    return this.http.put<DeviceUpdateResponse>(
      `${this.apiUrl}/${encodeURIComponent(
        deviceId
      )}`,
      device
    );

  }

}