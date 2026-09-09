import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  private readonly apiUrl =
    'http://server.evchargeman.com:5679/logs';

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
}