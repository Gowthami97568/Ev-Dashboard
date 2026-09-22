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
        if (response.success) {
          localStorage.setItem(this.sessionKey, JSON.stringify({
            username: response.data?.username ?? username,
            token: response.data?.token
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
      return typeof session?.token === 'string' ? session.token : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }
}