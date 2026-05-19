import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { APIResponse } from '../../models/api-response.interface';
import { SparePart } from '../../models/spare-parts.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getDataProducts(): Observable<APIResponse<Product[]>> {
    return this.http.get<APIResponse<Product[]>>(
      this.baseUrl + `api/products`
    );
  }
  getAllSpareParts() {
    return this.http.get<APIResponse<SparePart[]>>(
      this.baseUrl + `api/products/spare-parts-all`
    );
  }
  getSparePart(ProductId: number): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0,
    };
    return this.http.post<any>(
      this.baseUrl + `api/products/spare-parts`,
      asset
    );
  }
  getDataUnit(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `api/unit`);
  }

  deleteWorkOrders(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/products/delete`, ids);
  }

  saveData(data: any): Observable<any> {
    return this.http.post(this.baseUrl + `api/products/save-data`, data);
  }

  saveDataProduct(data: any): Observable<any> {
    return this.http.post(
      this.baseUrl + `api/products/save-data-product`,
      data
    );
  }
}
