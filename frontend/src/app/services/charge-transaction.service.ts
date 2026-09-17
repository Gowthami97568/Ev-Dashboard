import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// =====================================================
// TRANSACTION MODEL
// =====================================================

export interface ChargeTransaction {

  transactionid: string | number;

  mobile?: string | null;

  deviceid?: string | null;

  starttime?: string | null;

  endtime?: string | null;

  duration?: number | string | null;

  chargestatus?: number | string | null;

  consumewallet?: number | string | null;

  createdby?: string | null;

  createddate?: string | null;

  kwh?: number | string | null;

  chargedate?: string | null;

  modifiedBy?: string | null;

  modifiedDate?: string | null;

  invoiceid?: string | null;

  commtime?: string | null;

  chargevalue?: number | string | null;

  reason?: string | null;

  voltage?: number | string | null;

  current?: number | string | null;

  status?: string | null;

  watt?: number | string | null;

  autostart?: number | boolean | string | null;

  rfid?: string | null;

  currcnt?: number | string | null;

  volcnt?: number | string | null;

  refcode?: string | null;

  meterstart?: number | string | null;

  meterstop?: number | string | null;

  cgst?: number | string | null;

  sgst?: number | string | null;

  cgstvalue?: number | string | null;

  sgstvalue?: number | string | null;

  totalvalue?: number | string | null;

  metervaluetime?: string | null;

}


// =====================================================
// SUMMARY
// =====================================================

export interface TransactionSummary {

  total: number;

  charging: number;

  accepted: number;

  stopped: number;

  requested: number;

  totalKwh: number;

  totalChargeValue: number;

}


// =====================================================
// FILTERS
// =====================================================

export interface TransactionFilters {

  createdBy: string[];

  reasons: string[];

  statuses: string[];

  chargeStatuses: number[];

}


// =====================================================
// PAGINATION
// =====================================================

export interface TransactionPagination {

  page: number;

  limit: number;

  total: number;

  totalPages: number;

}


// =====================================================
// LIST RESPONSE
// =====================================================

export interface TransactionListResponse {

  success: boolean;

  message: string;

  data: {

    items: ChargeTransaction[];

    pagination: TransactionPagination;

  };

}


// =====================================================
// SUMMARY RESPONSE
// =====================================================

export interface TransactionSummaryResponse {

  success: boolean;

  message: string;

  data: TransactionSummary;

}


// =====================================================
// FILTER RESPONSE
// =====================================================

export interface TransactionFiltersResponse {

  success: boolean;

  message: string;

  data: TransactionFilters;

}


// =====================================================
// UPDATE RESPONSE
// =====================================================

export interface TransactionUpdateResponse {

  success: boolean;

  message: string;

  data?: ChargeTransaction;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class ChargeTransactionService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/charge-transactions`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // ===================================================
  // SUMMARY
  // ===================================================

  getSummary():
    Observable<TransactionSummaryResponse> {

    return this.http.get<TransactionSummaryResponse>(
      `${this.apiUrl}/summary`
    );

  }


  // ===================================================
  // FILTERS
  // ===================================================

  getFilters():
    Observable<TransactionFiltersResponse> {

    return this.http.get<TransactionFiltersResponse>(
      `${this.apiUrl}/filters`
    );

  }


  // ===================================================
  // TRANSACTIONS
  // ===================================================

  getTransactions(
    page: number,
    limit: number,
    search: string,
    chargeStatus: string,
    status: string,
    reason: string,
    createdBy: string,
    dateFrom: string,
    dateTo: string
  ): Observable<TransactionListResponse> {

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


    if (search.trim()) {

      params = params.set(
        'search',
        search.trim()
      );

    }


    if (chargeStatus !== '') {

      params = params.set(
        'chargeStatus',
        chargeStatus
      );

    }


    if (status !== '') {

      params = params.set(
        'status',
        status
      );

    }


    if (reason !== '') {

      params = params.set(
        'reason',
        reason
      );

    }


    if (createdBy !== '') {

      params = params.set(
        'createdBy',
        createdBy
      );

    }


    if (dateFrom !== '') {

      params = params.set(
        'dateFrom',
        dateFrom
      );

    }


    if (dateTo !== '') {

      params = params.set(
        'dateTo',
        dateTo
      );

    }


    return this.http.get<TransactionListResponse>(
      this.apiUrl,
      {
        params
      }
    );

  }


  // ===================================================
  // UPDATE TRANSACTION
  // ===================================================

  updateTransaction(
    transactionId: string | number,
    transaction: Partial<ChargeTransaction>
  ): Observable<TransactionUpdateResponse> {

    const encodedId =
      encodeURIComponent(
        String(transactionId)
      );


    return this.http.put<TransactionUpdateResponse>(
      `${this.apiUrl}/${encodedId}`,
      transaction
    );

  }

}