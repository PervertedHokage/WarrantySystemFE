export class WarrantyClaimDTO {
  Id = 0;
  ClaimNo: string | null = '';
  CustomerName = '';
  CustomerEmail: string | null = '';
  CustomerPhoneNumber = '';
  CustomerAddress: string | null = '';
  ProductId: number | null = null;
  ProductName: string | null = null;
  IssueId: number | null = null;
  SerialNumber = '';
  HasProtection: boolean | null = null;
  HasAdapter: boolean | null = null;
  HasCable: boolean | null = null;
  HasBattery: boolean | null = null;
  HasIssueWhenOpenBox: boolean | null = null;
  HasCollision: boolean | null = null;
  OperationEnvironment: number | null = null;
  Status: number | null = null;
  StatusText: string | null = null;
  Type: number | null = null;
  FileAddress: string | null = '';
  Transporter: string | null = '';
  LadingNumber: string | null = '';
  Note = '';
  RecipientAddress: string | null = '';
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';
  DiagnosisDate: Date | null = null;
  DiagnosisWorker: string | null = '';
  DiagnosisNote: string | null = '';
  ReceptionDate: Date | null = null;
  ReceptionWorker: string | null = '';

  constructor(init?: Partial<WarrantyClaimDTO>) {
    Object.assign(this, init);
  }
}
