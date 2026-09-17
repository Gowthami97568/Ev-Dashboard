import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalyticsInsights {
  transactions: number;
  averageKwh: number;
  averageDuration: number;
  averageWatt: number;
  autostartRate: number;
  totalKwh: number;
  totalChargeValue: number;
}

export interface TransactionTrend {
  day: string;
  total: number;
}

export interface EnergyTrend {
  day: string;
  kwh: number;
}

export interface ChargeValueTrend {
  day: string;
  value: number;
}

export interface AutostartData {
  type: string;
  total: number;
}

export interface PeakUsage {
  busiestDay: string | null;
  busiestDayTransactions: number;
  peakHour: number | null;
  peakHourTransactions: number;
  totalKwh: number;
}

export interface TopCharger {
  deviceId: string;
  sessions: number;
  totalKwh: number;
  totalValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/analytics`;

  constructor(
    private readonly http: HttpClient
  ) {}

  getInsights(): Observable<{
    success: boolean;
    data: AnalyticsInsights;
  }> {
    return this.http.get<{
      success: boolean;
      data: AnalyticsInsights;
    }>(
      `${this.apiUrl}/insights`
    );
  }

  getTransactionTrend(): Observable<{
    success: boolean;
    data: TransactionTrend[];
  }> {
    return this.http.get<{
      success: boolean;
      data: TransactionTrend[];
    }>(
      `${this.apiUrl}/transaction-trend`
    );
  }

  getEnergyTrend(): Observable<{
    success: boolean;
    data: EnergyTrend[];
  }> {
    return this.http.get<{
      success: boolean;
      data: EnergyTrend[];
    }>(
      `${this.apiUrl}/energy-trend`
    );
  }

  getChargeValueTrend(): Observable<{
    success: boolean;
    data: ChargeValueTrend[];
  }> {
    return this.http.get<{
      success: boolean;
      data: ChargeValueTrend[];
    }>(
      `${this.apiUrl}/charge-value-trend`
    );
  }

  getAutostart(): Observable<{
    success: boolean;
    data: AutostartData[];
  }> {
    return this.http.get<{
      success: boolean;
      data: AutostartData[];
    }>(
      `${this.apiUrl}/autostart`
    );
  }

  getPeakUsage(): Observable<{
    success: boolean;
    data: PeakUsage;
  }> {
    return this.http.get<{
      success: boolean;
      data: PeakUsage;
    }>(
      `${this.apiUrl}/peak-usage`
    );
  }

  getTopChargers(): Observable<{
    success: boolean;
    data: TopCharger[];
  }> {
    return this.http.get<{
      success: boolean;
      data: TopCharger[];
    }>(
      `${this.apiUrl}/top-chargers`
    );
  }
}