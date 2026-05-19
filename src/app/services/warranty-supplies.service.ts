import { BASE_URL } from '../runtime';
import { HttpClient } from '@angular/common/http';
import {  Injectable , Inject } from '@angular/core';
import { APIResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class WarrantySuppliesService {
  private apiUrl = this.baseUrl + 'api/warrantyclaimusedsparepart';

  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getByClaimId(claimId: number) {
    return this.http.get<APIResponse<any[]>>(`${this.apiUrl}/claim/${claimId}`);
  }

  create(data: any) {
    return this.http.post<APIResponse<any>>(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.put<APIResponse<any>>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<APIResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
