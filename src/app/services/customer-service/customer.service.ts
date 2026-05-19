import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Customer } from '../../models/customer.model';
import { APIResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getDataCustomers(): Observable<APIResponse<Customer[]>> {
    return this.http.get<APIResponse<Customer[]>>(
      this.baseUrl + `api/customer/customer`
    );
  }
    saveDataCustomer(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/customer`, data);
  }
    deleteCustomer(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/customer/delete`, ids);
  }
}
