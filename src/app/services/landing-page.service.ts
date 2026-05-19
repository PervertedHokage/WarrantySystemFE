import { BASE_URL } from '../runtime';
import { HttpClient } from '@angular/common/http';
import {  Injectable , Inject } from '@angular/core';
import { WarrantyClaim } from '../models/warranty-claims/warranty-claim.model';
import { APIResponse } from '../models/api-response.interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WarrantyClaimTracking } from '../models/warranty-claims/warranty-claim-tracking.model';
import { WarrantyClaimDTO } from '../models/warranty-claims/warranty-claim-dto.model';
import { CheckStatusBySerialResult } from '../models/serial-check-result.model';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private apiUrl = this.baseUrl + 'api/warrantyclaim/';
  constructor(private http: HttpClient,
    private notification: NzNotificationService, @Inject(BASE_URL) private baseUrl: string) {}
  getWarrantyClaim(phoneNumber: string, email: string, claimNo: string) {
    return this.http.get<APIResponse<WarrantyClaimDTO[]>>(
      this.apiUrl +
        `?phone-number=${encodeURIComponent(
          phoneNumber
        )}&email=${encodeURIComponent(email)}&claim-no=${encodeURIComponent(
          claimNo
        )}`
    );
  }
  createWarrantyClaim(data: WarrantyClaim) {
    return this.http.post<APIResponse<WarrantyClaim>>(this.apiUrl, data);
  }
  getWarrantyClaimTrackings(claimId: number) {
    return this.http.get<APIResponse<WarrantyClaimTracking[]>>(
      this.baseUrl + `api/warrantyclaimtracking?claim-id=${claimId}`
    );
  }
  createWarrantyClaimTrackings(data: WarrantyClaimTracking) {
    return this.http.post<APIResponse<WarrantyClaimTracking[]>>(
      this.baseUrl + `api/warrantyclaimtracking`,
      data
    );
  }
  updateWarrantyClaimTrackings(data: WarrantyClaimTracking) {
    return this.http.put<APIResponse<WarrantyClaimTracking[]>>(
      this.baseUrl + `api/warrantyclaimtracking/${data.Id}`,
      data
    );
  }
  deleteWarrantyClaimTrackings(data: WarrantyClaimTracking){
    return this.http.delete<APIResponse<WarrantyClaimTracking[]>>(
      this.baseUrl + `api/warrantyclaimtracking/${data.Id}`
    );
  }
  checkStatus(serial: string) {
    return this.http.get<APIResponse<CheckStatusBySerialResult>>(
      this.baseUrl + `api/serialcheck?serial=${serial}`
    );
  }
  uploadFiles(id: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });
    return this.http.post<APIResponse<any>>(
      this.apiUrl + `${id}/upload`,
      formData
    );
  }
}
