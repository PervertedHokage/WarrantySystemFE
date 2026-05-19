import { BASE_URL } from '../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IssuesGroup } from '../../models/issues.model';
import { APIResponse } from '../../models/api-response.interface';
import { IssueFullDTO } from '../../models/issue-full-dto.model';

@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getIssues(IssuesGroupId: number): Observable<any> {
    const asset: any = {
      IssuesGroupId: IssuesGroupId || 0,
    };
    return this.http.post<APIResponse<IssueFullDTO[]>>(
      this.baseUrl + `api/issues/issues`,
      asset,
    );
  }

  getDataIssuesGroup(): Observable<APIResponse<IssuesGroup[]>> {
    return this.http.get<APIResponse<IssuesGroup[]>>(
      this.baseUrl + `api/issues`,
    );
  }

  saveDataIssuesGroup(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + `api/issues/save-data-issues`,
      data,
    );
  }

  deleteIssues(ids: number[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api/issues/delete`, ids);
  }
}
