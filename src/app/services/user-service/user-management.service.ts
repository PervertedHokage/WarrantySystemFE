import { BASE_URL } from '../../runtime';
import { HttpClient } from '@angular/common/http';
import {  Injectable , Inject } from '@angular/core';
import { IUser } from '../../models/user.interface';
import { APIResponse } from '../../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private apiUrl = this.baseUrl + 'api/user/';
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}
  getAllUsers() {
    return this.http.get<APIResponse<IUser[]>>(this.apiUrl);
  }
}
