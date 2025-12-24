import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IssuesService {

  constructor(private http: HttpClient) {}

    getIssues(
    IssuesGroupId: number,
  ): Observable<any> {
    const asset: any = {
      IssuesGroupId: IssuesGroupId || 0
    };
    return this.http.post<any>(
      environment.host + `api/issues/get-issues`,
      asset
    );
  }

  getDataIssuesGroup(): Observable<any> {
    return this.http.get<any>(environment.host + `api/issues/get-issues-group`);
  }

  saveDataIssuesGroup(data: any): Observable<any> {
    return this.http.post<any>(
      environment.host + `api/issues/save-data-issues`,
      data
    );
  }
}
