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
import { Login } from './login/login';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [

  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  // =========================================================
  // DASHBOARD
  // =========================================================

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminAuthGuard]
  },

  // =========================================================
  // MANAGEMENT
  // =========================================================

  {
    path: 'users',
    component: EvUsersComponent,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'wallet-history',
    component: WalletHistory,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'charge-manager',
    component: ChargeManager,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'charge-transactions',
    component: ChargeTransactions,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'devices-master',
    component: DevicesMaster,
    canActivate: [adminAuthGuard]
  },

  // =========================================================
  // LOGS
  // =========================================================

  // Existing Logs component = Device Logs
  {
    path: 'device-logs',
    component: Logs,
    canActivate: [adminAuthGuard]
  },

  // Separate Server Logs component
  {
    path: 'server-logs',
    component: ServerLogs,
    canActivate: [adminAuthGuard]
  },

  // =========================================================
  // CONFIGURATION
  // =========================================================

  {
    path: 'account-info',
    component: AccountInfo,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'app-versions',
    component: AppVersions,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'config-data',
    component: ConfigData,
    canActivate: [adminAuthGuard]
  },

  {
    path: 'socket-info',
    component: SocketInfo,
    canActivate: [adminAuthGuard]
  },

  // =========================================================
  // ANALYTICS
  // =========================================================

  {
    path: 'analytics',
    component: Analytics,
    canActivate: [adminAuthGuard]
  },

  // =========================================================
  // OTHERS
  // =========================================================

  {
    path: 'settings',
    component: Settings,
    canActivate: [adminAuthGuard]
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
    redirectTo: 'login'
  }

];