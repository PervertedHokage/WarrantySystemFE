import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    constructor(private http: HttpClient) {}

    getDataProducts(): Observable<any> {
    return this.http.get<any>(environment.host + `api/products/get-products`);
  }

   saveDataProduct(data:any):Observable<any>
 {
  return this.http.post(environment.host + `api/products/save-product`, data)
 }
}
