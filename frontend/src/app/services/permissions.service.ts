import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserPermissionRow {
  UserId: string;
  Permission_Map: string;
}

export interface PermissionRowsResponse {
  success: boolean;
  data: UserPermissionRow[];
}

export interface SavePermissionResponse {
  success: boolean;
  data: UserPermissionRow;
}

interface CurrentUserPermissionResponse {
  success: boolean;
  data: UserPermissionRow;
}

export const PERMISSION_OPTIONS = [
  'allow:All',
  'allow:Dashboard', 'view:Dashboard',
  'allow:User', 'view:User',
  'allow:Wallet', 'view:Wallet',
  'allow:chargeMaster', 'view:chargeMaster',
  'allow:Transaction', 'view:Transaction',
  'allow:Device', 'view:Device',
  'allow:Settings', 'view:Settings',
  'allow:AccountInfo', 'view:AccountInfo',
  'allow:AppVersion', 'view:AppVersion',
  'allow:DeviceLogs', 'view:DeviceLogs',
  'allow:ServerLogs', 'view:ServerLogs',
  'allow:ConfigData', 'view:ConfigData',
  'allow:SocketInfo', 'view:SocketInfo',
  'allow:Analytics', 'view:Analytics',
  'allow:Logs', 'view:Logs'
] as const;

const CANONICAL_PERMISSION = new Map(
  PERMISSION_OPTIONS.map(permission => [
    permission.toLowerCase(),
    permission
  ])
);

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly apiUrl = `${environment.apiUrl}/api/permissions`;
  private permissionRows: UserPermissionRow[] = [];

  private readonly moduleAliases: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'User',
    evusers: 'User',
    wallet: 'Wallet',
    wallethistory: 'Wallet',
    devices: 'Device',
    devicesmaster: 'Device',
    chargemanager: 'chargeMaster',
    chargemaster: 'chargeMaster',
    chargetransactions: 'Transaction',
    transactions: 'Transaction',
    transactionhistory: 'Transaction',
    settings: 'Settings',
    permissions: 'Settings',
    accountinfo: 'AccountInfo',
    accountversion: 'AppVersion',
    appversions: 'AppVersion',
    devicelogs: 'DeviceLogs',
    serverlogs: 'ServerLogs',
    configdata: 'ConfigData',
    socketinfo: 'SocketInfo',
    logs: 'Logs',
    analytics: 'Analytics'
  };

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getCurrentUserId(): string {
    return this.authService.getUsername() || '';
  }

  loadPermissionRows(): Observable<PermissionRowsResponse> {
    return this.http.get<PermissionRowsResponse>(this.apiUrl).pipe(
      map(response => {
        if (
          !response ||
          response.success !== true ||
          !Array.isArray(response.data) ||
          response.data.some(row =>
            typeof row?.UserId !== 'string' ||
            typeof row?.Permission_Map !== 'string'
          )
        ) {
          throw new Error('Permission API returned an invalid response.');
        }

        return response;
      }),
      tap(response => {
        this.permissionRows = response.data;
      })
    );
  }

  loadCurrentUserPermissions(): Observable<CurrentUserPermissionResponse> {
    return this.http.get<PermissionRowsResponse>(this.apiUrl).pipe(
      map(response => {
        if (
          response?.success !== true ||
          !Array.isArray(response.data) ||
          response.data.some(row =>
            typeof row?.UserId !== 'string' ||
            typeof row?.Permission_Map !== 'string'
          )
        ) {
          throw new Error('Permission API returned an invalid current-user response.');
        }

        const currentUserId = this.getCurrentUserId().trim();
        if (!currentUserId) {
          throw new Error('Authenticated UserId is missing.');
        }

        const row = response.data.find(
          permission => permission.UserId.toLowerCase() === currentUserId.toLowerCase()
        ) || { UserId: currentUserId, Permission_Map: '' };

        return { success: true, data: row };
      }),
      tap(response => {
        this.mergePermissionRow(response.data);
      })
    );
  }

  savePermissions(userId: string, permissions: string[]): Observable<SavePermissionResponse> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId || normalizedUserId.length > 191) {
      return throwError(() => new Error('Enter a valid User ID.'));
    }

    const normalizedPermissions = this.normalizePermissions(permissions);
    if (normalizedPermissions === null) {
      return throwError(() => new Error('Select only supported permissions.'));
    }

    const encodedUserId = encodeURIComponent(normalizedUserId);
    return this.http.put<SavePermissionResponse>(
      `${this.apiUrl}/${encodedUserId}`,
      { Permission_Map: normalizedPermissions.join(',') }
    ).pipe(
      map(response => {
        if (
          response?.success !== true ||
          typeof response.data?.UserId !== 'string' ||
          typeof response.data?.Permission_Map !== 'string'
        ) {
          throw new Error('Permission API returned an invalid save response.');
        }

        return response;
      }),
      tap(response => {
        this.mergePermissionRow(response.data);
      })
    );
  }

  getUserPermissions(userId: string): string[] {
    const row = this.permissionRows.find(
      item => item.UserId.toLowerCase() === userId.trim().toLowerCase()
    );
    return this.parsePermissionMap(row?.Permission_Map || '');
  }

  getPermissionTags(userId: string): string[] {
    return this.getUserPermissions(userId);
  }

  hasAccess(module: string, action: 'view' | 'allow' = 'view'): boolean {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return false;
    }

    const permissions = this.getUserPermissions(userId).map(value => value.toLowerCase());
    const moduleKey = this.normalizeModule(module).toLowerCase();

    if (permissions.includes('allow:all')) {
      return true;
    }

    if (permissions.includes(`allow:${moduleKey}`)) {
      return true;
    }

    return action === 'view' && permissions.includes(`view:${moduleKey}`);
  }

  normalizePermissions(permissions: string[]): string[] | null {
    const normalized: string[] = [];
    const seen = new Set<string>();

    for (const rawPermission of permissions) {
      const permission = CANONICAL_PERMISSION.get(rawPermission.trim().toLowerCase());
      if (!permission) {
        return null;
      }

      const key = permission.toLowerCase();
      if (!seen.has(key)) {
        normalized.push(permission);
        seen.add(key);
      }
    }

    return seen.has('allow:all') ? ['allow:All'] : normalized;
  }

  private normalizeModule(module: string): string {
    const key = module.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.moduleAliases[key] || module;
  }

  private parsePermissionMap(permissionMap: string): string[] {
    return this.normalizePermissions(permissionMap.split(',').filter(Boolean)) || [];
  }

  private mergePermissionRow(savedRow: UserPermissionRow): void {
    const existingIndex = this.permissionRows.findIndex(
      row => row.UserId.toLowerCase() === savedRow.UserId.toLowerCase()
    );

    if (existingIndex === -1) {
      this.permissionRows = [...this.permissionRows, savedRow];
    } else {
      this.permissionRows = this.permissionRows.map((row, index) =>
        index === existingIndex ? savedRow : row
      );
    }
  }
}
