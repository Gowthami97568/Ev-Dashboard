/**
 * Domain models mapped to the backend tables:
 * accountinfo, appversion, chargeman, chargetransaction, config_data,
 * devices_master, evusers, socketInfo, wallethistory.
 */

export interface AccountInfo {
  accountId: string;
  ownerName: string;
  role: 'Administrator' | 'Operator' | 'Viewer';
  email: string;
  avatarUrl?: string;
}

export interface AppVersion {
  version: string;
  releasedOn: string;
  isLatest: boolean;
}

/** A physical charge point / charge manager (station controller). */
export interface ChargeMan {
  stationId: string;
  stationName: string;
  city: string;
  status: 'Available' | 'Charging' | 'Maintenance' | 'Offline';
  utilizationPercent: number;
}

export interface ChargeTransaction {
  transactionId: string;
  stationId: string;
  sessionId: string;
  energyKwh: number;
  revenue: number;
  startedAt: string;
  endedAt?: string;
}

export interface ConfigData {
  key: string;
  value: string;
  updatedAt: string;
}

/** A physical device / connector attached to a station. */
export interface DevicesMaster {
  deviceId: string;
  stationId: string;
  socketType: string;
  status: 'Available' | 'Charging' | 'Maintenance' | 'Offline';
}

export interface EvUser {
  userId: string;
  name: string;
  email: string;
  vehicleModel?: string;
}

export interface SocketInfo {
  socketId: string;
  deviceId: string;
  connectorType: 'CCS2' | 'CHAdeMO' | 'Type2' | 'GB/T';
  maxPowerKw: number;
}

export interface WalletHistory {
  walletTxnId: string;
  userId: string;
  amount: number;
  type: 'Topup' | 'Debit' | 'Refund';
  createdAt: string;
}

/** View-model shapes consumed directly by the dashboard template. */
export interface DashboardSummary {
  activeStations: number;
  activeStationsDelta: string;
  activeCharging: number;
  activeChargingUtilization: number;
  energyTodayKwh: number;
  energyTodayDelta: string;
  energyPeakTime: string;
  revenueToday: string;
  revenueDelta: string;
  revenueTarget: string;
}

export interface HourlyEnergyPoint {
  hourLabel: string;
  kwh: number;
}

export interface StationStatusBreakdown {
  available: number;
  charging: number;
  maintenance: number;
  offline: number;
}

export interface StationRevenueRow {
  rank: number;
  station: string;
  revenue: string;
  revenueTrend: 'up' | 'down';
  revenueChangePercent: string;
  sessions: number;
  utilizationPercent: number;
}

export type AlertSeverity = 'error' | 'warning' | 'info' | 'maintenance';

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  minutesAgo: number;
  timestamp: string;
}

export interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}
