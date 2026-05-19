import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class UnitService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getDataUnit(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `api/unit`);
  }

  saveDataUnit(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/unit`, data);
  }

  deleteUnit(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/unit/delete`, ids);
  }
}
