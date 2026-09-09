import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  AnalyticsService,
  AnalyticsInsights,
  TransactionTrend,
  EnergyTrend,
  ChargeValueTrend,
  AutostartData,
  PeakUsage,
  TopCharger
} from '../services/analytics.service';

import {
  Sidebar
} from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-analytics',
  standalone: true,

  imports: [
    CommonModule,
    Sidebar
  ],

  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {

  loading = true;

  errorMessage = '';

  insights: AnalyticsInsights = {
    transactions: 0,
    averageKwh: 0,
    averageDuration: 0,
    averageWatt: 0,
    autostartRate: 0,
    totalKwh: 0,
    totalChargeValue: 0
  };

  transactionTrend: TransactionTrend[] = [];

  energyTrend: EnergyTrend[] = [];

  chargeValueTrend: ChargeValueTrend[] = [];

  autostartData: AutostartData[] = [];

  peakUsage: PeakUsage = {
    busiestDay: null,
    busiestDayTransactions: 0,
    peakHour: null,
    peakHourTransactions: 0,
    totalKwh: 0
  };

  topChargers: TopCharger[] = [];

  constructor(
    private readonly analyticsService:
      AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {

    this.loading = true;

    this.errorMessage = '';

    forkJoin({

      insights:
        this.analyticsService
          .getInsights()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: this.insights
              })
            )
          ),

      transactions:
        this.analyticsService
          .getTransactionTrend()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: [] as TransactionTrend[]
              })
            )
          ),

      energy:
        this.analyticsService
          .getEnergyTrend()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: [] as EnergyTrend[]
              })
            )
          ),

      value:
        this.analyticsService
          .getChargeValueTrend()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: [] as ChargeValueTrend[]
              })
            )
          ),

      autostart:
        this.analyticsService
          .getAutostart()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: [] as AutostartData[]
              })
            )
          ),

      peak:
        this.analyticsService
          .getPeakUsage()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: this.peakUsage
              })
            )
          ),

      chargers:
        this.analyticsService
          .getTopChargers()
          .pipe(
            catchError(() =>
              of({
                success: false,
                data: [] as TopCharger[]
              })
            )
          )
    }).subscribe({

      next: (result) => {

        if (result.insights.success) {
          this.insights =
            result.insights.data;
        }

        this.transactionTrend =
          result.transactions.data || [];

        this.energyTrend =
          result.energy.data || [];

        this.chargeValueTrend =
          result.value.data || [];

        this.autostartData =
          result.autostart.data || [];

        if (result.peak.success) {
          this.peakUsage =
            result.peak.data;
        }

        this.topChargers =
          result.chargers.data || [];
      },

      error: (error: unknown) => {

        console.error(
          'Analytics loading error:',
          error
        );

        this.errorMessage =
          'Some analytics data could not be loaded.';
      },

      complete: () => {
        this.loading = false;
      }
    });
  }

  // =====================================================
  // TRANSACTION CHART
  // =====================================================

  getMaxTransaction(): number {

    return Math.max(
      ...this.transactionTrend.map(
        item => item.total
      ),
      1
    );
  }

  getTransactionHeight(
    value: number
  ): string {

    return `${
      Math.max(
        6,
        (value / this.getMaxTransaction()) * 100
      )
    }%`;
  }

  // =====================================================
  // ENERGY CHART
  // =====================================================

  getMaxEnergy(): number {

    return Math.max(
      ...this.energyTrend.map(
        item => item.kwh
      ),
      1
    );
  }

  getEnergyHeight(
    value: number
  ): string {

    return `${
      Math.max(
        6,
        (value / this.getMaxEnergy()) * 100
      )
    }%`;
  }

  // =====================================================
  // VALUE CHART
  // =====================================================

  getMaxChargeValue(): number {

    return Math.max(
      ...this.chargeValueTrend.map(
        item => item.value
      ),
      1
    );
  }

  getChargeValueHeight(
    value: number
  ): string {

    return `${
      Math.max(
        6,
        (value / this.getMaxChargeValue()) * 100
      )
    }%`;
  }

  // =====================================================
  // AUTOSTART
  // =====================================================

  getAutostartTotal(): number {

    return this.autostartData.reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );
  }

  getAutostartPercentage(
    value: number
  ): number {

    const total =
      this.getAutostartTotal();

    if (!total) {
      return 0;
    }

    return Math.round(
      (value / total) * 100
    );
  }

  // =====================================================
  // FORMAT DAY
  // =====================================================

  formatDay(
    value: string
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short'
      }
    );
  }

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    value: number
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(value || 0);
  }

  // =====================================================
  // PEAK HOUR
  // =====================================================

  formatPeakHour(
    hour: number | null
  ): string {

    if (hour === null) {
      return '—';
    }

    const start =
      Number(hour);

    const end =
      (start + 1) % 24;

    return `${this.formatHour(start)} – ${this.formatHour(end)}`;
  }

  private formatHour(
    hour: number
  ): string {

    const suffix =
      hour >= 12
        ? 'PM'
        : 'AM';

    const display =
      hour % 12 === 0
        ? 12
        : hour % 12;

    return `${display} ${suffix}`;
  }
}