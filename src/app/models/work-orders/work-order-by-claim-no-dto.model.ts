export class WorkOrderByClaimNoDTO {
  Id: number = 0;
  Code: string = '';

  DateStart: Date | string | null = null;
  DateEnd: Date | string | null = null;
  CompletedDate: Date | string | null = null;

  ProgressComplete: number | null = null;
  StatusId: number | null = null;
  Description: string = '';

  QuotationId: number | null = null;
  QuotationNumber: string = '';

  ProductId: number | null = null;
  Name: string = '';
  ProductCode: string = '';

  FullName: string = '';
  UserId: number | null = null;

  WarrantyClaimId: number | null = null;
  CustomerName: string = '';
  ClaimNo: string = '';

  Status: string = '';

  constructor(init?: Partial<WorkOrderByClaimNoDTO>) {
    Object.assign(this, init);
  }
}
