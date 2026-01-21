import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from '../environments/environment';
import { APIResponse } from '../models/api-response.interface';
import { WarrantyClaim } from '../models/warranty-claims/warranty-claim.model';
import { WarrantyClaimDTO } from '../models/warranty-claims/warranty-claim-dto.model';

@Injectable({
  providedIn: 'root',
})
export class WarrantyClaimManagementService {
  private apiUrl = environment.host + 'api/warrantyclaim/';
  constructor(
    private http: HttpClient,
    private notification: NzNotificationService
  ) {}
  getWarrantyClaims(
    phoneNumber: string,
    email: string,
    claimNo: string,
    fromDate: Date,
    toDate: Date,
    status: number
  ) {
    const from = fromDate.toISOString().slice(0, 10); // yyyy-MM-dd
    const to = toDate.toISOString().slice(0, 10);
    return this.http.get<APIResponse<WarrantyClaimDTO[]>>(
      this.apiUrl +
        `filter?phone-number=${phoneNumber}&email=${email}&claim-no=${claimNo}&from-date=${from}&to-date=${to}&status=${status}`
    );
  }
  getWarrantyClaimDropdownData() {
    return this.http.get<APIResponse<WarrantyClaimDTO[]>>(this.apiUrl + `info`);
  }
  getWarrantyClaimById(id: number) {
    return this.http.get<APIResponse<WarrantyClaimDTO>>(this.apiUrl + id);
  }
  createOrUpdate(data: WarrantyClaim | WarrantyClaimDTO) {
    if (!data.Id) return this.create(data);
    else return this.update(data);
  }
  create(data: WarrantyClaim | WarrantyClaimDTO) {
    return this.http.post<APIResponse<WarrantyClaim | WarrantyClaimDTO>>(
      this.apiUrl,
      data
    );
  }
  update(data: WarrantyClaim | WarrantyClaimDTO) {
    return this.http.put<APIResponse<WarrantyClaim | WarrantyClaimDTO>>(
      this.apiUrl + data.Id,
      data
    );
  }
  delete(data: WarrantyClaim | WarrantyClaimDTO) {
    return this.http.delete<APIResponse<WarrantyClaim | WarrantyClaimDTO>>(
      this.apiUrl + data.Id
    );
  }
}
