import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Dashboard } from './dashboard';
import { DashboardService } from './services/dashboard.service';

describe('Dashboard', () => {

  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  const mockDashboardResponse = {
    success: true,
    message: 'Dashboard loaded successfully',
    data: {
      chargers: 10,
      transactions: 100,
      users: 50,
      accountInfo: 20,
      appVersions: 5,
      walletHistory: 30,
      configData: 15,
      devices: 25
    }
  };

  const mockTrendResponse = {
    success: true,
    message: 'Trends loaded successfully',
    data: {
      transactionsLast7Days: [
        {
          day: '2026-08-13',
          count: 10
        },
        {
          day: '2026-08-14',
          count: 20
        },
        {
          day: '2026-08-15',
          count: 15
        },
        {
          day: '2026-08-16',
          count: 25
        },
        {
          day: '2026-08-17',
          count: 30
        },
        {
          day: '2026-08-18',
          count: 35
        },
        {
          day: '2026-08-19',
          count: 40
        }
      ]
    }
  };

  beforeEach(async () => {

    dashboardServiceSpy =
      jasmine.createSpyObj<DashboardService>(
        'DashboardService',
        [
          'getDashboard',
          'getDashboardTrends'
        ]
      );

    dashboardServiceSpy.getDashboard.and.returnValue(
      of(mockDashboardResponse)
    );

    dashboardServiceSpy.getDashboardTrends.and.returnValue(
      of(mockTrendResponse)
    );

    await TestBed.configureTestingModule({

      imports: [
        Dashboard
      ],

      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceSpy
        }
      ],

      schemas: [
        NO_ERRORS_SCHEMA
      ]

    })
      .overrideComponent(Dashboard, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Dashboard);

    component = fixture.componentInstance;
  });


  // ============================================================
  // CREATE COMPONENT
  // ============================================================

  it('should create the dashboard', () => {

    expect(component).toBeTruthy();

  });


  // ============================================================
  // INITIAL VALUES
  // ============================================================

  it('should initialize dashboard data with zero values', () => {

    expect(component.dashboardData).toEqual({
      chargers: 0,
      transactions: 0,
      users: 0,
      accountInfo: 0,
      appVersions: 0,
      walletHistory: 0,
      configData: 0,
      devices: 0
    });

  });


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  it('should load dashboard data successfully', () => {

    component.loadDashboard();

    expect(
      dashboardServiceSpy.getDashboard
    ).toHaveBeenCalled();

    expect(
      component.dashboardData.chargers
    ).toBe(10);

    expect(
      component.dashboardData.transactions
    ).toBe(100);

    expect(
      component.dashboardData.users
    ).toBe(50);

    expect(
      component.dashboardData.devices
    ).toBe(25);

    expect(component.loading).toBeFalse();

    expect(component.errorMessage).toBe('');

  });


  // ============================================================
  // LOAD DASHBOARD - CHART DATA
  // ============================================================

  it('should update chart data after dashboard data loads', () => {

    component.loadDashboard();

    expect(
      component.compositionChartData.labels
    ).toEqual([
      'Chargers',
      'Transactions',
      'Users',
      'Devices'
    ]);

    expect(
      component.compositionChartData.datasets[0].data
    ).toEqual([
      10,
      100,
      50,
      25
    ]);

    // comparisonChartData now powers a horizontal bar chart sorted
    // largest → smallest, so both labels and data reflect that order
    // rather than the original field order.
    // Source values: chargers 10, transactions 100, users 50, devices 25,
    // accountInfo 20, appVersions 5, walletHistory 30, configData 15.
    expect(
      component.comparisonChartData.labels
    ).toEqual([
      'Transactions',
      'Users',
      'Wallet History',
      'Devices',
      'Account Info',
      'Config Data',
      'Chargers',
      'App Versions'
    ]);

    expect(
      component.comparisonChartData.datasets[0].data
    ).toEqual([
      100,
      50,
      30,
      25,
      20,
      15,
      10,
      5
    ]);

  });


  // ============================================================
  // LOAD DASHBOARD - API FAILURE
  // ============================================================

  it('should handle dashboard API failure', () => {

    dashboardServiceSpy.getDashboard.and.returnValue(
      throwError(() => new Error('API error'))
    );

    component.loadDashboard();

    expect(
      component.errorMessage
    ).toBe(
      'Unable to connect to dashboard backend.'
    );

    expect(component.loading).toBeFalse();

  });


  // ============================================================
  // LOAD DASHBOARD - UNSUCCESSFUL RESPONSE
  // ============================================================

  it('should handle unsuccessful dashboard response', () => {

    dashboardServiceSpy.getDashboard.and.returnValue(
      of({
        success: false,
        message: 'Failed to load dashboard data',
        data: {
          chargers: 0,
          transactions: 0,
          users: 0,
          accountInfo: 0,
          appVersions: 0,
          walletHistory: 0,
          configData: 0,
          devices: 0
        }
      })
    );

    component.loadDashboard();

    expect(
      component.errorMessage
    ).toBe(
      'Failed to load dashboard data'
    );

    expect(component.loading).toBeFalse();

  });


  // ============================================================
  // LOAD TRANSACTION TRENDS
  // ============================================================

  it('should load transaction trend data successfully', () => {

    component.loadTrends();

    expect(
      dashboardServiceSpy.getDashboardTrends
    ).toHaveBeenCalled();

    expect(
      component.hasTrendData
    ).toBeTrue();

    expect(
      component.transactionsTrendData.labels?.length
    ).toBe(7);

    expect(
      component.transactionsTrendData.datasets[0].data
    ).toEqual([
      10,
      20,
      15,
      25,
      30,
      35,
      40
    ]);

  });


  // ============================================================
  // LOAD TRANSACTION TRENDS - FAILURE
  // ============================================================

  it('should handle transaction trend API failure', () => {

    dashboardServiceSpy.getDashboardTrends.and.returnValue(
      throwError(() => new Error('Trend API error'))
    );

    component.loadTrends();

    expect(
      component.hasTrendData
    ).toBeFalse();

  });


  // ============================================================
  // EMPTY TREND DATA
  // ============================================================

  it('should handle empty transaction trend data', () => {

    dashboardServiceSpy.getDashboardTrends.and.returnValue(
      of({
        success: true,
        message: 'No trend data',
        data: {
          transactionsLast7Days: []
        }
      })
    );

    component.loadTrends();

    expect(
      component.hasTrendData
    ).toBeFalse();

  });


  // ============================================================
  // INITIALIZATION
  // ============================================================

  it('should load dashboard and trends on initialization', () => {

    fixture.detectChanges();

    expect(
      dashboardServiceSpy.getDashboard
    ).toHaveBeenCalled();

    expect(
      dashboardServiceSpy.getDashboardTrends
    ).toHaveBeenCalled();

    expect(
      component.dashboardData.transactions
    ).toBe(100);

    expect(
      component.hasTrendData
    ).toBeTrue();

  });


  // ============================================================
  // REFRESH DASHBOARD
  // ============================================================

  it('should refresh dashboard data', () => {

    component.refreshDashboard();

    expect(
      dashboardServiceSpy.getDashboard
    ).toHaveBeenCalled();

    expect(
      dashboardServiceSpy.getDashboardTrends
    ).toHaveBeenCalled();

  });

});