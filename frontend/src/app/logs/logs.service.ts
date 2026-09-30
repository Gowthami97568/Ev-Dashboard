import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LogDeviceIdsResponse {
  success: boolean;
  message: string;
  data: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor(
    private readonly http: HttpClient
  ) {}

  getDeviceIds(): Observable<LogDeviceIdsResponse> {
    return this.http.get<LogDeviceIdsResponse>(
      `${environment.apiUrl}/api/logs/devices`
    );
  }

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
      `${environment.apiUrl}/api/logs`,
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