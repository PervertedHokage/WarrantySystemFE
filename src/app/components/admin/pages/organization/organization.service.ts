import { BASE_URL } from '../../../../runtime';
import {  Injectable , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private _url = this.baseUrl + 'api/organization/';

  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}

  getOrganizations(): Observable<any> {
    return this.http.get<any>(this._url);
  }

  getOrganizationById(id: number): Observable<any> {
    return this.http.get<any>(`${this._url}${id}`);
  }

  createOrganization(organization: any): Observable<any> {
    return this.http.post<any>(this._url, organization);
  }

  updateOrganization(id: number, organization: any): Observable<any> {
    return this.http.put<any>(`${this._url}${id}`, organization);
  }

  deleteOrganization(id: number): Observable<any> {
    return this.http.delete<any>(`${this._url}${id}`);
  }

  setDataTree(flatData: any[], valueField: string): any[] {
    const map = new Map<number, any>();
    const tree: any[] = [];

    // Bước 1: Map từng item theo ID
    flatData.forEach((item) => {
      map.set(item[valueField], { ...item, _children: [] });
    });

    // Bước 2: Gắn item vào parent hoặc top-level
    flatData.forEach((item) => {
      const current = map.get(item[valueField]);
      if (item.ParentId && item.ParentId != 0) {
        const parent = map.get(item.ParentId);
        if (parent) {
          parent._children.push(current);
        } else {
          tree.push(current);
        }
      } else {
        tree.push(current);
      }
    });

    return tree;
  }
  buildOrgTree(items: any[]): any[] {
    const map = new Map<number, any>();

    items.forEach((item) => {
      map.set(item.Id, {
        title: item.OrganizationName,
        key: item.Id, // key là number
        value: item.Id, // value là number
        children: [],
      });
    });

    const roots: any[] = [];

    items.forEach((item) => {
      const node = map.get(item.Id);

      if (item.ParentId === 0) {
        roots.push(node);
      } else {
        const parent = map.get(item.ParentId);
        if (parent) parent.children.push(node);
      }
    });

    map.forEach((n) => {
      if (n.children.length === 0) {
        n.isLeaf = true;
        delete n.children;
      }
    });

    return roots;
  }
}
