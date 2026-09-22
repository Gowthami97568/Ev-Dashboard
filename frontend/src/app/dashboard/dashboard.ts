import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';

import {
  DashboardService,
  DashboardData,
  DashboardResponse,
  DashboardTrends,
  DashboardTrendsResponse
} from './services/dashboard.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    Sidebar,
    Topbar,
    BaseChartDirective
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  dashboardData: DashboardData & {
    socketInfo: number;
    logs: number;
  } = {
    chargers: 0,
    transactions: 0,
    users: 0,
    accountInfo: 0,
    appVersions: 0,
    walletHistory: 0,
    configData: 0,
    devices: 0,

    // NEW
    socketInfo: 0,
    logs: 0
  };


  loading = true;

  errorMessage = '';

  hasTrendData = false;


  // ============================================================
  // DOUGHNUT CHART
  // ============================================================

  compositionChartData: ChartData<'doughnut'> = {

    labels: [
      'Chargers',
      'Transactions',
      'Users',
      'Devices',
      'Socket Info',
      'Logs'
    ],

    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],

        backgroundColor: [
          '#0d9488',
          '#f59e0b',
          '#6366f1',
          '#ef4444',
          '#06b6d4',
          '#ec4899'
        ],

        borderWidth: 0,

        hoverOffset: 8
      }
    ]
  };


  compositionChartOptions: ChartOptions<'doughnut'> = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: '68%',

    plugins: {

      legend: {

        position: 'bottom',

        labels: {

          usePointStyle: true,

          pointStyle: 'circle',

          boxWidth: 8,

          padding: 16,

          font: {
            size: 12
          }
        }
      },


      tooltip: {

        callbacks: {

          label: (context) => {

            const value =
              Number(context.raw ?? 0);

            return `${context.label}: ${value.toLocaleString()}`;
          }

        }

      }

    }

  };


  // ============================================================
  // BAR CHART
  // ============================================================

  comparisonChartData: ChartData<'bar'> = {

    labels: [
      'Chargers',
      'Transactions',
      'Users',
      'Devices',
      'Account Info',
      'App Versions',
      'Wallet History',
      'Config Data',
      'Socket Info',
      'Logs'
    ],

    datasets: [
      {

        label: 'Records',

        data: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],

        backgroundColor: [
          '#0d9488',
          '#f59e0b',
          '#6366f1',
          '#ef4444',
          '#0ea5e9',
          '#84cc16',
          '#a855f7',
          '#ec4899',
          '#06b6d4',
          '#f43f5e'
        ],

        borderRadius: 6,

        borderSkipped: false,

        maxBarThickness: 34

      }
    ]

  };


  comparisonChartOptions: ChartOptions<'bar'> = {

    indexAxis: 'y',

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },


      tooltip: {

        callbacks: {

          label: (context) => {

            const value =
              Number(context.raw ?? 0);

            return `${value.toLocaleString()} records`;
          }

        }

      }

    },


    scales: {

      x: {

        beginAtZero: true,

        grid: {
          color: '#eef2f7'
        },

        ticks: {
          precision: 0
        }

      },


      y: {

        grid: {
          display: false
        }

      }

    }

  };


  // ============================================================
  // TRANSACTION LINE CHART
  // ============================================================

  transactionsTrendData: ChartData<'line'> = {

    labels: [],

    datasets: [
      {

        label: 'Transactions',

        data: [],

        borderColor: '#0d9488',

        backgroundColor:
          'rgba(13, 148, 136, 0.12)',

        fill: true,

        tension: 0.35,

        pointRadius: 4,

        pointHoverRadius: 6,

        pointBackgroundColor: '#0d9488',

        pointBorderColor: '#ffffff',

        pointBorderWidth: 2

      }
    ]

  };


  transactionsTrendOptions: ChartOptions<'line'> = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

      mode: 'index',

      intersect: false

    },


    plugins: {

      legend: {
        display: false
      },


      tooltip: {

        callbacks: {

          label: (context) => {

            const value =
              Number(context.raw ?? 0);

            return `${value.toLocaleString()} transactions`;
          }

        }

      }

    },


    scales: {

      x: {

        grid: {
          display: false
        }

      },


      y: {

        beginAtZero: true,

        grid: {
          color: '#eef2f7'
        },

        ticks: {
          precision: 0
        }

      }

    }

  };


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}


  // ============================================================
  // SIGN OUT
  // ============================================================

  onSignOut(): void {
    this.authService.logout();
    sessionStorage.clear();

    void this.router.navigate(
      ['/login'],
      {
        replaceUrl: true
      }
    );
  }


  // ============================================================
  // CARD NAVIGATION
  // ============================================================


  // 1. TOTAL CHARGERS

  goToChargeManager(): void {
    this.router.navigate(['/charge-manager']);
  }


  // 2. TRANSACTIONS

  goToChargeTransactions(): void {
    this.router.navigate(['/charge-transactions']);
  }


  // 3. EV USERS

  goToUsers(): void {
    this.router.navigate(['/users']);
  }


  // 4. DEVICES

  goToDevicesMaster(): void {
    this.router.navigate(['/devices-master']);
  }


  // 5. ACCOUNT INFO

  goToAccountInfo(): void {
    this.router.navigate(['/account-info']);
  }


  // 6. APP VERSIONS

  goToAppVersions(): void {
    this.router.navigate(['/app-versions']);
  }


  // 7. WALLET HISTORY

  goToWalletHistory(): void {
    this.router.navigate(['/wallet-history']);
  }


  // 8. CONFIG DATA

  goToConfigData(): void {
    this.router.navigate(['/config-data']);
  }


  // 9. SOCKET INFO

  goToSocketInfo(): void {
    this.router.navigate(['/socket-info']);
  }


  // 10. LOGS

  goToLogs(): void {
    this.router.navigate(['/device-logs']);
  }


  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {

    this.loadDashboard();

    this.loadTrends();

  }


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';


    this.dashboardService
      .getDashboard()
      .subscribe({

        next: (response: DashboardResponse) => {

          console.log(
            'DASHBOARD RESPONSE:',
            response
          );


          if (
            response.success &&
            response.data
          ) {

            /*
             * Keep all backend dashboard values.
             *
             * socketInfo and logs are safely read even if
             * the backend does not return them yet.
             */

            const data = response.data as DashboardData & {
              socketInfo?: number;
              logs?: number;
            };


            this.dashboardData = {

              ...response.data,

              socketInfo:
                Number(data.socketInfo ?? 0),

              logs:
                Number(data.logs ?? 0)

            };


            this.updateSummaryCharts();

          } else {

            this.errorMessage =
              response.message ||
              'Failed to load dashboard data.';

          }


          this.loading = false;

        },


        error: (error: unknown) => {

          console.error(
            'Dashboard API Error:',
            error
          );


          this.errorMessage =
            'Unable to connect to dashboard backend.';

          this.loading = false;

        }

      });

  }


  // ============================================================
  // LOAD TRENDS
  // ============================================================

  loadTrends(): void {

    this.dashboardService
      .getDashboardTrends()
      .subscribe({

        next: (
          response: DashboardTrendsResponse
        ) => {

          console.log(
            'DASHBOARD TREND RESPONSE:',
            response
          );


          if (
            response.success &&
            response.data
          ) {

            this.updateTrendChart(
              response.data
            );

          } else {

            this.hasTrendData = false;

          }

        },


        error: (error: unknown) => {

          console.warn(
            'Dashboard trends unavailable:',
            error
          );

          this.hasTrendData = false;

        }

      });

  }


  // ============================================================
  // UPDATE SUMMARY CHARTS
  // ============================================================

  private updateSummaryCharts(): void {

    const d =
      this.dashboardData;


    // ==========================================================
    // DOUGHNUT
    // ==========================================================

    this.compositionChartData = {

      labels: [
        'Chargers',
        'Transactions',
        'Users',
        'Devices',
        'Socket Info',
        'Logs'
      ],


      datasets: [
        {

          data: [

            Number(d.chargers || 0),

            Number(d.transactions || 0),

            Number(d.users || 0),

            Number(d.devices || 0),

            Number(d.socketInfo || 0),

            Number(d.logs || 0)

          ],


          backgroundColor: [
            '#0d9488',
            '#f59e0b',
            '#6366f1',
            '#ef4444',
            '#06b6d4',
            '#ec4899'
          ],


          borderWidth: 0,

          hoverOffset: 8

        }
      ]

    };


    // ==========================================================
    // BAR
    // ==========================================================

    this.comparisonChartData = {

      labels: [

        'Chargers',
        'Transactions',
        'Users',
        'Devices',
        'Account Info',
        'App Versions',
        'Wallet History',
        'Config Data',
        'Socket Info',
        'Logs'

      ],


      datasets: [
        {

          label: 'Records',


          data: [

            Number(d.chargers || 0),

            Number(d.transactions || 0),

            Number(d.users || 0),

            Number(d.devices || 0),

            Number(d.accountInfo || 0),

            Number(d.appVersions || 0),

            Number(d.walletHistory || 0),

            Number(d.configData || 0),

            Number(d.socketInfo || 0),

            Number(d.logs || 0)

          ],


          backgroundColor: [

            '#0d9488',
            '#f59e0b',
            '#6366f1',
            '#ef4444',
            '#0ea5e9',
            '#84cc16',
            '#a855f7',
            '#ec4899',
            '#06b6d4',
            '#f43f5e'

          ],


          borderRadius: 6,

          borderSkipped: false,

          maxBarThickness: 34

        }
      ]

    };

  }


  // ============================================================
  // UPDATE TRANSACTION TREND
  // ============================================================

  private updateTrendChart(
    trends: DashboardTrends
  ): void {

    const points =
      trends.transactionsLast7Days ?? [];


    if (points.length === 0) {

      this.hasTrendData = false;


      this.transactionsTrendData = {

        labels: [],

        datasets: [
          {

            label: 'Transactions',

            data: [],

            borderColor: '#0d9488',

            backgroundColor:
              'rgba(13, 148, 136, 0.12)',

            fill: true,

            tension: 0.35,

            pointRadius: 4,

            pointHoverRadius: 6,

            pointBackgroundColor: '#0d9488',

            pointBorderColor: '#ffffff',

            pointBorderWidth: 2

          }

        ]

      };


      return;
    }


    this.hasTrendData = true;


    // ==========================================================
    // LABELS
    // ==========================================================

    const labels =
      points.map(point => {

        if (!point.day) {
          return '';
        }


        const date =
          new Date(point.day);


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return point.day;

        }


        return date.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric'
          }
        );

      });


    // ==========================================================
    // VALUES
    // ==========================================================

    const values =
      points.map(
        point =>
          Number(point.count || 0)
      );


    // ==========================================================
    // CHART DATA
    // ==========================================================

    this.transactionsTrendData = {

      labels,

      datasets: [
        {

          label: 'Transactions',

          data: values,

          borderColor: '#0d9488',

          backgroundColor:
            'rgba(13, 148, 136, 0.12)',

          fill: true,

          tension: 0.35,

          pointRadius: 4,

          pointHoverRadius: 6,

          pointBackgroundColor: '#0d9488',

          pointBorderColor: '#ffffff',

          pointBorderWidth: 2

        }
      ]

    };


    console.log(
      'TREND LABELS:',
      labels
    );


    console.log(
      'TREND VALUES:',
      values
    );

  }

}