import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalesOrderService {
  constructor(private http: HttpClient) {}

  getSaleOrder(OrderId: number): Observable<any> {
    const asset: any = {
      OrderId: OrderId || 0,
    };
    return this.http.post<any>(environment.host + `api/saleorder`, asset);
  }

  getProduct(ProductId: number): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0,
    };
    return this.http.post<any>(
      environment.host + `api/saleorder/product`,
      asset
    );
  }

  saveDataSaleOder(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/saleorder/save-data-sale-order`,
      data
    );
  }

  deleteSaleOrder(ids: number[]): Observable<any> {
    return this.http.post<any>(environment.host + `api/saleorder/delete`, ids);
  }
}
