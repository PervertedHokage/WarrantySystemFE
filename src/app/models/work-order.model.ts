export class WorkOrder {
  Id = 0;
  Code = '';
  DateStart: Date | null = null;
  DateEnd: Date | null = null;
  CompletedDate: Date | null = null;
  ProgressComplete = 0;
  StatusId = 0;
  Description: string | null = '';
  QuotationId = 0;
  QuotationNumber = '';
  ProductId = 0;
  Name = '';
  ProductCode = '';
  FullName = '';
  UserId = 0;
  WarrantyClaimId = 0;
  CustomerName = '';
  ClaimNo = '';
  Status = '';

  constructor(init?: Partial<WorkOrder>) {
    Object.assign(this, init);
  }
}

export class WorkOrderSpareDetail {
  Id = 0;
  Code = '';
  DateStart: Date | null = null;
  DateEnd: Date | null = null;
  CompletedDate: Date | null = null;
  ProgressComplete = 0;
  StatusId = 0;
  Description: string | null = '';
  QuotationId = 0;
  QuotationNumber = '';
  ProductId = 0;
  Name = '';
  FullName = '';
  UserId = 0;
  WarrantyClaimId = 0;
  CustomerName = '';
  ClaimNo = '';
  Status = '';
  SparePartGroupId = 0;
  Quantity = 0;
  WorkOrderSpareId = 0;

  constructor(init?: Partial<WorkOrderSpareDetail>) {
    Object.assign(this, init);
  }
}

