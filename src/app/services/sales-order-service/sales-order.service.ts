import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { APIResponse } from '../../models/api-response.interface';
import { SaleOrder } from '../../models/sale-order.model';

@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getSaleOrder(
    OrderId: number,
    FromDateStart: Date,
    ToDateStart: Date
  ): Observable<APIResponse<SaleOrder[]>> {
    let params = new HttpParams()
      .set('OrderId', (OrderId || 0).toString())
      .set('FromDateStart', FromDateStart ? FromDateStart.toISOString() : '')
      .set('ToDateStart', ToDateStart ? ToDateStart.toISOString() : '');
    return this.http.get<APIResponse<SaleOrder[]>>(
      this.baseUrl + `api/saleorder`,
      { params }
    );
  }

  saveDataSaleOder(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/saleorder`, data);
  }

  deleteSaleOrder(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/saleorder/delete`, ids);
  }
  exportExcel(OrderId: number, FromDateStart: Date, ToDateStart: Date) {
    let params = new HttpParams()
      .set('OrderId', (OrderId || 0).toString())
      .set('FromDateStart', FromDateStart ? FromDateStart.toISOString() : '')
      .set('ToDateStart', ToDateStart ? ToDateStart.toISOString() : '');
    return this.http.get<Blob>(
      this.baseUrl + `api/saleorder/export-excel`,
      {
        params,
        responseType: 'blob' as 'json',
      }
    );
  }
}
