import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
      environment.host + `api/serial/get-serial`,
      asset
    );
  }

    getDataProducts(): Observable<any> {
    return this.http.get<any>(environment.host + `api/products/get-products`);
  }

   saveDataSerial(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/serial/save-serial`,
      data
    );
  }
}
