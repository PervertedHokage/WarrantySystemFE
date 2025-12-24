import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    constructor(private http: HttpClient) {}

    getDataProducts(): Observable<any> {
    return this.http.get<any>(environment.host + `api/products/get-products`);
  }

     getSparePart(
    ProductId: number,
  ): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0
    };
    return this.http.post<any>(
      environment.host + `api/products/get-spare-parts`,
      asset
    );
  }

//    saveDataProduct(data:any):Observable<any>
//  {
//   return this.http.post(environment.host + `api/products/save-product`, data)
//  }

   saveDataProduct(data:any):Observable<any>
 {
  return this.http.post(environment.host + `api/products/save-data-product`, data)
 }
}
