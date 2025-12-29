import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { WarrantyClaim } from '../models/warranty-claims/warranty-claim.model';
import { APIResponse } from '../models/api-response.interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WarrantyClaimTracking } from '../models/warranty-claims/warranty-claim-tracking.model';
import { WarrantyClaimDTO } from '../models/warranty-claims/warranty-claim-dto.model';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private apiUrl = environment.host + 'api/warrantyclaim/';
  constructor(
    private http: HttpClient,
    private notification: NzNotificationService
  ) {}
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
      environment.host + `api/warrantyclaimtracking?claim-id=${claimId}`
    );
  }
  createWarrantyClaimTrackings(data: WarrantyClaimTracking) {
    return this.http.post<APIResponse<WarrantyClaimTracking[]>>(
      environment.host + `api/warrantyclaimtracking`,
      data
    );
  }
  updateWarrantyClaimTrackings(data: WarrantyClaimTracking) {
    return this.http.put<APIResponse<WarrantyClaimTracking[]>>(
      environment.host + `api/warrantyclaimtracking/${data.Id}`,
      data
    );
  }
  deleteWarrantyClaimTrackings(data: WarrantyClaimTracking){
    return this.http.delete<APIResponse<WarrantyClaimTracking[]>>(
      environment.host + `api/warrantyclaimtracking/${data.Id}`
    );
  }
}
