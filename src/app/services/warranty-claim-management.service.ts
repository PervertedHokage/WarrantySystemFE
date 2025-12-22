import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WarrantyClaimManagementService {
private apiUrl = environment.host + 'api/warrantyclaim/';
  constructor(
    private http: HttpClient,
    private notification: NzNotificationService
  ) {}

}
