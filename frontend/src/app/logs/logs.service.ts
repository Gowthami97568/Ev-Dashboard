import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  private readonly apiUrl =
       'https://ev-dashboard-backend.onrender.com/api/logs';

  constructor(
    private readonly http: HttpClient
  ) {}

  getLogs(
    deviceId = '',
    fromDateTime = '',
    toDateTime = ''
  ): Observable<string> {
    let params = new HttpParams();

    if (deviceId.trim()) {
      params = params.set('deviceId', deviceId.trim());
    }

    if (fromDateTime.trim()) {
      params = params.set('fromDateTime', fromDateTime.trim());
    }

    if (toDateTime.trim()) {
      params = params.set('toDateTime', toDateTime.trim());
    }

    return this.http.get(
      this.apiUrl,
      {
        params,
        responseType: 'text'
      }
    );
  }

  getServerLogs(): Observable<string> {
    return this.http.get(
      `${environment.apiUrl}/api/server-logs`,
      {
        responseType: 'text'
      }
    );
  }
}