import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {

    constructor(private http: HttpClient) {}

       getWorkOrder(
    WorkOrderId: number,
  ): Observable<any> {
    const asset: any = {
      WorkOrderId: WorkOrderId || 0
    };
    return this.http.post<any>(
      environment.host + `api/workorder/get-work-order`,
      asset
    );
  }

       getWorkOrderDetail(
    WorkOrderId: number,
  ): Observable<any> {
    const asset: any = {
      WorkOrderId: WorkOrderId || 0
    };
    return this.http.post<any>(
      environment.host + `api/workorder/get-work-order-detail`,
      asset
    );
  }

    getEmployees(
    Status: number,
  ): Observable<any> {
    const asset: any = {
      Status: Status || 0
    };
    return this.http.post<any>(
      environment.host + `api/workorder/get-employees`,
      asset
    );
  }

   getStatus(): Observable<any> {
    return this.http.get<any>(environment.host + `api/workorder/get-status`);
  }

     getDataProducts(): Observable<any> {
    return this.http.get<any>(environment.host + `api/products/get-products`);
  }

  getQuotation(): Observable<any> {
    return this.http.get<any>(environment.host + `api/workorder/get-quotation`);
  }

    getSparePartGroup(): Observable<any> {
    return this.http.get<any>(environment.host + `api/products/get-spare-parts-group`);
  }

      getWarrantyClaims(): Observable<any> {
    return this.http.get<any>(environment.host + `api/workorder/get-warranty-claim`);
  }

    saveDataWorkOrder(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/workorder/save-data-work-order`,
      data
    );
  }

  deleteWorkOrders(ids: number[]): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/workorder/delete`,
      ids
    );
  }

}
