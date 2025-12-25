import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class SerialService {

    constructor(private http: HttpClient) {}

     getSerial(
    ProductId: number,
  ): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0
    };
    return this.http.post<any>(
      environment.host + `api/serial`,
      asset
    );
  }

    getDataProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(environment.host + `api/products`);
  }

   saveDataSerial(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/serial/save-serial`,
      data
    );
  }
}
