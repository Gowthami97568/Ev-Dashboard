import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';
import { environment } from '../../../environments/environment';


// ======================================================
// CONFIG DATA RECORD
// ======================================================

export interface ConfigDataRecord {

  [key: string]: any;

  // Internal database record ID
  // Used only for UPDATE
  __record_id?: string | number;

}


// ======================================================
// SUMMARY
// ======================================================

export interface ConfigDataSummary {

  total: number;
}




// ======================================================
// SUMMARY RESPONSE
// ======================================================

export interface ConfigDataSummaryResponse {

  success: boolean;

  message?: string;

  data?: ConfigDataSummary;

}


// ======================================================
// COLUMNS RESPONSE
// ======================================================

export interface ConfigDataColumnsResponse {

  success: boolean;

  message?: string;

  data?: {

    columns: string[];

    identifierColumn?: string | null;

  };

}


// ======================================================
// PAGINATION
// ======================================================

export interface ConfigDataPagination {

  page: number;

  limit: number;

  total: number;

  totalPages: number;

}


// ======================================================
// LIST RESPONSE
// ======================================================

export interface ConfigDataListResponse {

  success: boolean;

  message?: string;

  data?: {

    items: ConfigDataRecord[];

    pagination: ConfigDataPagination;

  };

}


// ======================================================
// SINGLE RECORD RESPONSE
// ======================================================

export interface ConfigDataSingleResponse {

  success: boolean;

  message?: string;

  data?: ConfigDataRecord;

}


// ======================================================
// UPDATE RESPONSE
// ======================================================

export interface ConfigDataUpdateResponse {

  success: boolean;

  message?: string;

  data?: {

    affectedRows?: number;

    record?: ConfigDataRecord | null;

  };

}


// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {


  // ====================================================
  // API URL
  // ====================================================

  private readonly apiUrl =
    `${environment.apiUrl}/api/config-data`;


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // ====================================================
  // GET SUMMARY
  // ====================================================

  getSummary():
    Observable<ConfigDataSummaryResponse> {

    return this.http.get<ConfigDataSummaryResponse>(
      `${this.apiUrl}/summary`
    );

  }


  // ====================================================
  // GET DATABASE COLUMNS
  // ====================================================

  getColumns():
    Observable<ConfigDataColumnsResponse> {

    return this.http.get<ConfigDataColumnsResponse>(
      `${this.apiUrl}/columns`
    );

  }


  // ====================================================
  // GET CONFIG DATA
  // ====================================================

  getConfigData(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ):
    Observable<ConfigDataListResponse> {


    let params =
      new HttpParams()
        .set(
          'page',
          page.toString()
        )
        .set(
          'limit',
          limit.toString()
        );


    // ----------------------------------------------
    // SEARCH
    // ----------------------------------------------

    if (
      search.trim() !== ''
    ) {

      params =
        params.set(
          'search',
          search.trim()
        );

    }


    return this.http.get<ConfigDataListResponse>(
      this.apiUrl,
      {
        params
      }
    );

  }


  // ====================================================
  // GET SINGLE RECORD
  // ====================================================

  getConfigDataById(
    id: string | number
  ):
    Observable<ConfigDataSingleResponse> {

    return this.http.get<ConfigDataSingleResponse>(
      `${this.apiUrl}/${encodeURIComponent(String(id))}`
    );

  }


  // ====================================================
  // UPDATE RECORD
  // ====================================================

  updateRecord(
    id: string | number,
    payload: Partial<ConfigDataRecord>
  ):
    Observable<ConfigDataUpdateResponse> {


    console.log(
      'PUT URL:',
      `${this.apiUrl}/${encodeURIComponent(String(id))}`
    );


    console.log(
      'PUT PAYLOAD:',
      payload
    );


    return this.http.put<ConfigDataUpdateResponse>(
      `${this.apiUrl}/${encodeURIComponent(String(id))}`,
      payload
    );

  }

}