import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IUser } from '../../models/user.interface';
import { APIResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private apiUrl = environment.host + 'api/user/';
  constructor(private http: HttpClient) {}
  getAllUsers() {
    return this.http.get<APIResponse<IUser[]>>(this.apiUrl);
  }
}
