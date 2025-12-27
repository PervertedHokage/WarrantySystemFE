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
  getWarrantyClaimDropdownData() {
    return this.http.get<APIResponse<WarrantyClaim[]>>(this.apiUrl + `info`);
  }
  getWarrantyClaimById(id: number) {
    return this.http.get<APIResponse<WarrantyClaimDTO>>(this.apiUrl + id);
  }
}
