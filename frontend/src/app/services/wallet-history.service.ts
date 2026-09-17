import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';


// =====================================================
// WALLET RECORD
// =====================================================

export interface WalletRecord {
  [key: string]: unknown;
}


// =====================================================
// SUMMARY
// =====================================================

export interface WalletSummary {
  total: number;
}


// =====================================================
// SUMMARY RESPONSE
// =====================================================

export interface WalletSummaryResponse {

  success: boolean;

  message: string;

  data: WalletSummary;

}


// =====================================================
// COLUMNS RESPONSE
// =====================================================

export interface WalletColumnsResponse {

  success: boolean;

  message: string;

  data: {
    columns: string[];
  };

}


// =====================================================
// LIST DATA
// =====================================================

export interface WalletListData {

  items: WalletRecord[];

  pagination: {

    page: number;

    limit: number;

    total: number;

    totalPages: number;

  };

}


// =====================================================
// LIST RESPONSE
// =====================================================

export interface WalletListResponse {

  success: boolean;

  message: string;

  data: WalletListData;

}


// =====================================================
// UPDATE RESPONSE
// =====================================================

export interface WalletUpdateResponse {

  success: boolean;

  message: string;

  data?: WalletRecord;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class WalletHistoryService {

  private readonly apiUrl =
    'http://localhost:5000/api/wallet';


  constructor(
    private readonly http: HttpClient
  ) {}


  // ===================================================
  // GET SUMMARY
  // ===================================================

  getSummary():
    Observable<WalletSummaryResponse> {

    return this.http.get<WalletSummaryResponse>(
      `${this.apiUrl}/summary`
    );

  }


  // ===================================================
  // GET COLUMNS
  // ===================================================

  getColumns():
    Observable<WalletColumnsResponse> {

    return this.http.get<WalletColumnsResponse>(
      `${this.apiUrl}/columns`
    );

  }


  // ===================================================
  // GET WALLET HISTORY
  // ===================================================

  getWalletHistory(
    page = 1,
    limit = 10,
    search = '',
    type = ''
  ): Observable<WalletListResponse> {

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
      search.trim()
    ) {

      params =
        params.set(
          'search',
          search.trim()
        );

    }

    if (type.trim()) {
      params = params.set('type', type.trim());
    }


    return this.http.get<WalletListResponse>(
      this.apiUrl,
      {
        params
      }
    );

  }


  // ===================================================
  // UPDATE WALLET RECORD
  // ===================================================

  updateRecord(
    recordId: string,
    record: Partial<WalletRecord> & {
      __originalRecord?: WalletRecord;
    }
  ): Observable<WalletUpdateResponse> {

    return this.http.put<WalletUpdateResponse>(
      recordId
        ? `${this.apiUrl}/${encodeURIComponent(recordId)}`
        : this.apiUrl,
      record
    );

  }

}