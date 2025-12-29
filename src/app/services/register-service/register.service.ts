import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Register } from '../../models/register.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  getDataUser(Status: number): Observable<Register[]> {
    const asset: any = {
      Status: Status || 0,
    };
    return this.http.get<Register[]>(environment.host + `api/register`, {
      params: asset,
    });
  }

  saveData(data: any): Observable<any> {
    return this.http.post(environment.host + `api/register/save-data`, data);
  }
}
