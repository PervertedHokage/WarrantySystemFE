import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IssuesGroup } from '../../models/issues.model';
import { APIResponse } from '../../models/api-response.interface';
import { IssueFullDTO } from '../../models/issue-full-DTO.model';


@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  constructor(private http: HttpClient) {}

  getIssues(IssuesGroupId: number): Observable<any> {
    const asset: any = {
      IssuesGroupId: IssuesGroupId || 0,
    };
    return this.http.post<APIResponse<IssueFullDTO[]>>(
      environment.host + `api/issues/issues`,
      asset
    );
  }

  getDataIssuesGroup(): Observable<APIResponse<IssuesGroup[]>> {
  return this.http.get<APIResponse<IssuesGroup[]>>(
    environment.host + `api/issues`
  )
}

  saveDataIssuesGroup(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/issues/save-data-issues`,
      data
    );
  }
}
