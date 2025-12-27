import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { environment } from '../../environments/environment';
import { APIResponse } from '../../models/api-response.interface';
import { SparePart } from '../../models/spare-parts.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getDataProducts(): Observable<APIResponse<Product[]>> {
    return this.http.get<APIResponse<Product[]>>(
      environment.host + `api/products`
    );
  }
  getAllSpareParts() {
    return this.http.get<APIResponse<SparePart[]>>(
      environment.host + `api/products/spare-parts-all`
    );
  }
  getSparePart(ProductId: number): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0,
    };
    return this.http.post<any>(
      environment.host + `api/products/spare-parts`,
      asset
    );
  }
  getDataUnit(): Observable<any> {
    return this.http.get<any>(environment.host + `api/unit`);
  }

  deleteWorkOrders(ids: number[]): Observable<any> {
    return this.http.post<any>(environment.host + `api/products/delete`, ids);
  }

  saveDataProduct(data: any): Observable<any> {
    return this.http.post(
      environment.host + `api/products/save-data-product`,
      data
    );
  }
}
