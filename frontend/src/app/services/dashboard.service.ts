import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  chargers: number;
  transactions: number;
  users: number;
  accountInfo: number;
  appVersions: number;
  walletHistory: number;
  configData: number;
  devices: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export interface TransactionTrend {
  day: string;
  count: number;
}

export interface UserTrend {
  month: string;
  count: number;
}

export interface DashboardTrends {
  transactionsLast7Days: TransactionTrend[];
  usersLast6Months: UserTrend[];
}

export interface DashboardTrendsResponse {
  success: boolean;
  message: string;
  data: DashboardTrends;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = `${environment.apiUrl}/api/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }

  getDashboardTrends(): Observable<DashboardTrendsResponse> {
    return this.http.get<DashboardTrendsResponse>(
      `${this.apiUrl}/trends`
    );
  }
}