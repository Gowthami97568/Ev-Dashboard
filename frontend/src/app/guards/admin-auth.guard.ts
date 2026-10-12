import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';

export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const path = state.url.split('?')[0].replace(/^\//, '') || 'dashboard';

  return permissionsService.loadCurrentUserPermissions().pipe(
    map(() => permissionsService.hasAccess(path, 'view')
      ? true
      : router.createUrlTree(['/signed-out'], {
        queryParams: { reason: 'permission-denied' }
      })),
    catchError(error => {
      console.error('Failed to load permissions before route activation:', error);
      if (error.status === 401) {
        authService.logout();
        return of(router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        }));
      }

      if (error.status === 403) {
        return of(router.createUrlTree(['/signed-out'], {
          queryParams: { reason: 'permission-denied' }
        }));
      }

      return of(router.createUrlTree(['/signed-out'], {
        queryParams: { reason: 'permissions-unavailable' }
      }));
    })
  );
};