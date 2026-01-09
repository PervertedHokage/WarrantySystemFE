import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Customer } from '../../models/customer.model';
import { APIResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  getDataCustomers(): Observable<APIResponse<Customer[]>> {
    return this.http.get<APIResponse<Customer[]>>(
      environment.host + `api/customer/customer`
    );
  }
    saveDataCustomer(data: any): Observable<any> {
    return this.http.post<any>(environment.host + `api/customer`, data);
  }
    deleteCustomer(ids: number[]): Observable<any> {
    return this.http.post<any>(environment.host + `api/customer/delete`, ids);
  }
}
