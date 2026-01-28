import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { APIResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ResponseHistoryService {
  private apiUrl = environment.host + 'api/responsehistory';

  constructor(private http: HttpClient) {}

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
