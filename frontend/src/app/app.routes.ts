import { Routes } from '@angular/router';

import { Dashboard } from './dashboard/dashboard';
import { EvUsersComponent } from './ev-users/ev-users.component';
import { ChargeManager } from './charger-manager/charge-manager';
import { ChargeTransactions } from './charge-transactions/charge-transactions';
import { DevicesMaster } from './devices-master/devices-master';
import { WalletHistory } from './wallet-history/wallet-history';
import { AccountInfo } from './account-info/account-info';
import { AppVersions } from './app-versions/app-versions';
import { ConfigData } from './config-data/config-data';
import { SocketInfo } from './socket-info/socket-info';
import { Analytics } from './analytics/analytics';
import { Settings } from './settings/settings';

import { Logs } from './logs/logs';
import { ServerLogs } from './server-logs/server-logs';
import { SignedOut } from './signed-out/signed-out';

export const routes: Routes = [

  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // =========================================================
  // DASHBOARD
  // =========================================================

  {
    path: 'dashboard',
    component: Dashboard
  },

  // =========================================================
  // MANAGEMENT
  // =========================================================

  {
    path: 'users',
    component: EvUsersComponent
  },

  {
    path: 'wallet-history',
    component: WalletHistory
  },

  {
    path: 'charge-manager',
    component: ChargeManager
  },

  {
    path: 'charge-transactions',
    component: ChargeTransactions
  },

  {
    path: 'devices-master',
    component: DevicesMaster
  },

  // =========================================================
  // LOGS
  // =========================================================

  // Existing Logs component = Device Logs
  {
    path: 'device-logs',
    component: Logs
  },

  // Separate Server Logs component
  {
    path: 'server-logs',
    component: ServerLogs
  },

  // =========================================================
  // CONFIGURATION
  // =========================================================

  {
    path: 'account-info',
    component: AccountInfo
  },

  {
    path: 'app-versions',
    component: AppVersions
  },

  {
    path: 'config-data',
    component: ConfigData
  },

  {
    path: 'socket-info',
    component: SocketInfo
  },

  // =========================================================
  // ANALYTICS
  // =========================================================

  {
    path: 'analytics',
    component: Analytics
  },

  // =========================================================
  // OTHERS
  // =========================================================

  {
    path: 'settings',
    component: Settings
  },

  {
    path: 'signed-out',
    component: SignedOut
  },

  // =========================================================
  // INVALID ROUTES
  // =========================================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];