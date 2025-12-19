import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { WarrantyClaim } from '../models/warranty-claim.model';
import { APIResponse } from '../models/api-response.interface';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
    return this.http.get<APIResponse<WarrantyClaim[]>>(
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
}
