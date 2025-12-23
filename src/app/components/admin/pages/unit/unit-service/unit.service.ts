import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

    constructor(private http: HttpClient) {}

      getDataUnit(): Observable<any> {
    return this.http.get<any>(environment.host + `api/unit/get-unit`);
  }

   saveDataUnit(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/unit/save-data-unit`,
      data
    );
  }
}
