import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class SerialService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getSerial(ProductId: number): Observable<any> {
    const asset: any = {
      ProductId: ProductId || 0,
    };
    return this.http.post<any>(this.baseUrl + `api/serial`, asset);
  }

  getDataProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + `api/products`);
  }

  saveDataSerial(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + `api/serial/save-serial`,
      data
    );
  }

  deleteSerial(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/serial/delete`, ids);
  }
}
