import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    token: string;
    expiresIn: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'ev-admin-session';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (
          response.success &&
          response.data?.token &&
          response.data.expiresIn > 0
        ) {
          localStorage.setItem(this.sessionKey, JSON.stringify({
            username: response.data.username || username,
            token: response.data.token,
            expiresAt: Date.now() + response.data.expiresIn * 1000
          }));
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    try {
      const session = JSON.parse(localStorage.getItem(this.sessionKey) || 'null');
      if (typeof session?.token !== 'string') {
        return null;
      }

      if (
        typeof session.expiresAt === 'number' &&
        session.expiresAt <= Date.now()
      ) {
        this.logout();
        return null;
      }

      return session.token;
    } catch {
      return null;
    }
  }

  getUsername(): string | null {
    try {
      const session = JSON.parse(localStorage.getItem(this.sessionKey) || 'null');
      return typeof session?.username === 'string' ? session.username : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }
}