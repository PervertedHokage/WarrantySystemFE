import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { WorkOrder, WorkOrderSpareDetail } from '../../models/work-order.model';
import { Product } from '../../models/product.model';
import { APIResponse } from '../../models/api-response.interface';
import { WorkOrderByClaimNoDTO } from '../../models/work-orders/work-order-by-claim-no-dto.model';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getWorkOrder(WorkOrderId: number): Observable<APIResponse<WorkOrder[]>> {
    const asset: any = {
      WorkOrderId: WorkOrderId || 0,
    };
    return this.http.get<APIResponse<WorkOrder[]>>(
      this.baseUrl + `api/workorder`,
      { params: asset },
    );
  }
  getWorkOrderByClaimNo(
    ClaimNo: string,
  ): Observable<APIResponse<WorkOrderByClaimNoDTO[]>> {
    return this.http.get<APIResponse<WorkOrderByClaimNoDTO[]>>(
      this.baseUrl + `api/workorder/claim-no?claim-no=${ClaimNo}`,
    );
  }
  getWorkOrderDetail(
    WorkOrderId: number,
  ): Observable<APIResponse<WorkOrderSpareDetail[]>> {
    const asset: any = {
      WorkOrderId: WorkOrderId || 0,
    };
    return this.http.get<APIResponse<WorkOrderSpareDetail[]>>(
      this.baseUrl + `api/workorder/work-order-detail`,
      { params: asset },
    );
  }

  getWarrantyClaim(WarrantyClaimId: number): Observable<any> {
    const asset: any = {
      WarrantyClaimId: WarrantyClaimId || 0,
    };
    return this.http.get<any>(
      this.baseUrl + `api/workorder/warranty-claim`,
      { params: asset },
    );
  }

  getEmployees(Status: number): Observable<any> {
    const asset: any = {
      Status: Status || 0,
    };
    return this.http.post<any>(
      this.baseUrl + `api/workorder/employees`,
      asset,
    );
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `api/workorder/status`);
  }

  getDataProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + `api/products`);
  }

  getQuotation(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `api/workorder/quotation`);
  }

  getSparePartGroup(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + `api/products/spare-parts-group`,
    );
  }

  getWarrantyClaims(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + `api/workorder/warranty-claim`,
    );
  }

  saveDataWorkOrder(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + `api/workorder/save-data-work-order`,
      data,
    );
  }

  deleteWorkOrders(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/workorder/delete`, ids);
  }
}
