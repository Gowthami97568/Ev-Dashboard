import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// =====================================================
// CHARGER MODEL
// =====================================================

export interface Charger {
  mobile?: string | number | null;
  deviceid?: string | null;
  connectorid?: string | number | null;
  deviceparent?: string | null;
  devicekw?: string | number | null;
  devicetype?: string | null;
  hostname?: string | null;
  hostaddress?: string | null;
  latlong?: string | null;
  chargettype?: string | null;
  rph?: string | number | null;
  starttime?: string | null;
  endtime?: string | null;
  active?: number | boolean | string | null;
  capacity?: string | number | null;
  createdby?: string | null;
  createddate?: string | null;
  modifiedby?: string | null;
  modifieddate?: string | null;
  fullday?: number | boolean | string | null;
  country?: string | null;
}


// =====================================================
// SUMMARY
// =====================================================

export interface ChargerSummary {
  total: number;
  active: number;
  inactive: number;
  fullDay: number;
}


// =====================================================
// PAGINATION
// =====================================================

export interface ChargerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


// =====================================================
// GET CHARGERS RESPONSE
// =====================================================

export interface ChargerListResponse {
  success: boolean;
  message: string;

  data: {
    items: Charger[];
    pagination: ChargerPagination;
  };
}


// =====================================================
// SUMMARY RESPONSE
// =====================================================

export interface ChargerSummaryResponse {
  success: boolean;
  message: string;
  data: ChargerSummary;
}


// =====================================================
// UPDATE RESPONSE
// =====================================================

export interface ChargerUpdateResponse {
  success: boolean;
  message: string;
  data?: Charger;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ChargeManagerService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/chargers`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // ===================================================
  // GET CHARGERS
  // ===================================================

  getChargers(
    page: number,
    limit: number,
    search: string,
    active: string,
    deviceType: string,
    country: string
  ): Observable<ChargerListResponse> {

    let params = new HttpParams()
      .set(
        'page',
        String(page)
      )
      .set(
        'limit',
        String(limit)
      );


    // Search

    if (search.trim()) {

      params = params.set(
        'search',
        search.trim()
      );
    }


    // Active

    if (active !== '') {

      params = params.set(
        'active',
        active
      );
    }


    // IMPORTANT:
    // Backend expects "devicetype",
    // not "deviceType".

    if (deviceType.trim()) {

      params = params.set(
        'devicetype',
        deviceType.trim()
      );
    }


    // Country

    if (country.trim()) {

      params = params.set(
        'country',
        country.trim()
      );
    }


    return this.http.get<ChargerListResponse>(
      this.apiUrl,
      { params }
    );
  }


  // ===================================================
  // GET SUMMARY
  // ===================================================

  getChargerSummary():
    Observable<ChargerSummaryResponse> {

    return this.http.get<ChargerSummaryResponse>(
      `${this.apiUrl}/summary`
    );
  }


  // ===================================================
  // UPDATE CHARGER
  // ===================================================

  updateCharger(
    deviceId: string,
    charger: Charger
  ): Observable<ChargerUpdateResponse> {

    return this.http.put<ChargerUpdateResponse>(
      `${this.apiUrl}/${encodeURIComponent(deviceId)}`,
      charger
    );
  }

}