import { BASE_URL } from '../../runtime';
import { HttpClient } from '@angular/common/http';
import {  Injectable , Inject } from '@angular/core';
import { APIResponse } from '../../models/api-response.interface';
import { QuotationDetail } from '../../models/quotations/quotation-details.model';
import { Quotation } from '../../models/quotations/quotation.model';
import { QuotationDTO } from '../../models/quotations/quotation-dto.model';
import { QuotationDetailDTO } from '../../models/quotations/quotation-detail-dto.model';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private apiUrl = this.baseUrl + 'api/quotation/';
  constructor(private http: HttpClient, @Inject(BASE_URL) private baseUrl: string) {}
  getAll(fromDate: Date, toDate: Date, claimNo: string) {
    const from = fromDate.toISOString().slice(0, 10); // yyyy-MM-dd
    const to = toDate.toISOString().slice(0, 10);
    return this.http.get<APIResponse<QuotationDTO[]>>(
      this.baseUrl +
        `api/quotation/filter?from-date=${from}&to-date=${to}&claim-no=${claimNo}`,
    );
  }
  getDetailsById(quotationId: number) {
    return this.http.get<APIResponse<QuotationDetailDTO[]>>(
      this.baseUrl + `api/quotation/details/${quotationId}`,
    );
  }
  saveOrUpdate(data: Quotation) {
    return data.Id > 0 ? this.update(data) : this.save(data);
  }
  save(data: Quotation) {
    return this.http.post<APIResponse<QuotationDetail>>(
      this.baseUrl + `api/quotation`,
      data,
    );
  }
  update(data: Quotation) {
    return this.http.put<APIResponse<QuotationDetail>>(
      this.baseUrl + `api/quotation/${data.Id}`,
      data,
    );
  }
  saveDetails(data: QuotationDetail[]) {
    return this.http.post<APIResponse<QuotationDetail>>(
      this.baseUrl + `api/quotation/details`,
      data,
    );
  }
  exportExcel(fromDate: Date, toDate: Date, claimNo: string) {
    const from = fromDate.toISOString().slice(0, 10);
    const to = toDate.toISOString().slice(0, 10);
    return this.http.get(
      this.baseUrl +
        `api/quotation/export-excel?from-date=${from}&to-date=${to}&claim-no=${claimNo}`,
      { responseType: 'blob' },
    );
  }
}
