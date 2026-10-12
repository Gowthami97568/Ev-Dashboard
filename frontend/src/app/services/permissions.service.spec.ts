import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { PermissionsService } from './permissions.service';
import { environment } from '../../environments/environment';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('ev-admin-session', JSON.stringify({
      username: 'admin',
      token: 'test-token',
      expiresAt: Date.now() + 60_000
    }));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PermissionsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('ev-admin-session');
  });

  it('loads only the authenticated user permission row for route checks', () => {
    service.loadCurrentUserPermissions().subscribe();

    httpTestingController.expectOne(`${environment.apiUrl}/api/permissions`).flush({
      success: true,
      data: [{ UserId: 'admin', Permission_Map: 'allow:All' }]
    });

    expect(service.hasAccess('permissions', 'allow')).toBeTrue();
  });

  it('uses loaded database permission rows for view and edit access', () => {
    service.loadPermissionRows().subscribe();

    httpTestingController.expectOne(`${environment.apiUrl}/api/permissions`).flush({
      success: true,
      data: [
        { UserId: 'admin', Permission_Map: 'view:Wallet,allow:User' }
      ]
    });

    expect(service.hasAccess('wallet-history', 'view')).toBeTrue();
    expect(service.hasAccess('wallet-history', 'allow')).toBeFalse();
    expect(service.hasAccess('users', 'allow')).toBeTrue();
    expect(service.hasAccess('settings', 'view')).toBeFalse();
  });

  it('lets allow:All grant every module access', () => {
    service.loadPermissionRows().subscribe();

    httpTestingController.expectOne(`${environment.apiUrl}/api/permissions`).flush({
      success: true,
      data: [
        { UserId: 'admin', Permission_Map: 'allow:All' }
      ]
    });

    expect(service.hasAccess('wallet-history', 'view')).toBeTrue();
    expect(service.hasAccess('wallet-history', 'allow')).toBeTrue();
  });

  it('does not grant access from an unknown permission alone', () => {
    service.loadPermissionRows().subscribe();

    httpTestingController.expectOne(`${environment.apiUrl}/api/permissions`).flush({
      success: true,
      data: [
        { UserId: 'admin', Permission_Map: 'allow:MadeUp' }
      ]
    });

    expect(service.hasAccess('wallet-history', 'view')).toBeFalse();
    expect(service.hasAccess('wallet-history', 'allow')).toBeFalse();
  });

  it('does not grant edit access to view-only permissions', () => {
    service.loadPermissionRows().subscribe();

    httpTestingController.expectOne(`${environment.apiUrl}/api/permissions`).flush({
      success: true,
      data: [
        { UserId: 'admin', Permission_Map: 'view:Wallet' }
      ]
    });

    expect(service.hasAccess('wallet-history', 'view')).toBeTrue();
    expect(service.hasAccess('wallet-history', 'allow')).toBeFalse();
  });

  it('canonicalizes duplicate permissions and rejects unsupported values', () => {
    expect(service.normalizePermissions(['allow:wallet', 'allow:Wallet']))
      .toEqual(['allow:Wallet']);
    expect(service.normalizePermissions(['allow:UnlistedModule'])).toBeNull();
    expect(service.normalizePermissions(['view:All'])).toBeNull();
  });

  it('persists permission map values and updates the cached tags', () => {
    service.savePermissions('operator-1', ['view:Wallet', 'allow:User']).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/api/permissions/operator-1`
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      Permission_Map: 'view:Wallet,allow:User'
    });
    request.flush({
      success: true,
      data: {
        UserId: 'operator-1',
        Permission_Map: 'view:Wallet,allow:User'
      }
    });

    expect(service.getPermissionTags('operator-1')).toEqual([
      'view:Wallet',
      'allow:User'
    ]);
  });
});
