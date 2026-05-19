import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Register } from '../../models/register.model';
import { APIResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getDataUser(Status: number): Observable<APIResponse<Register[]>> {
    const asset: any = {
      Status: Status || 0,
    };
    return this.http.get<APIResponse<Register[]>>(
      this.baseUrl + `api/register`,
      {
        params: asset,
      }
    );
  }

  saveData(data: any): Observable<any> {
    return this.http.post(this.baseUrl + `api/register`, data);
  }
}
