export class WarrantyClaim {
  Id = 0;
  CustomerName = '';
  CustomerEmail = '';
  CustomerPhoneNumber = '';
  CustomerAddress = '';
  ProductName = '';
  ProductId: number | null = null;
  IssueId: number | null = null;
  SerialNumber = '';
  HasProtection: number | null = null;
  HasAdapter: number | null = null;
  HasCable: number | null = null;
  HasBattery: number | null = null;
  HasIssueWhenOpenBox: number | null = null;
  HasCollision: number | null = null;
  OperationEnvironment: number | null = null;
  Status: number | null = null;
  Type: number | null = null;
  FileAddress = '';
  Transporter = '';
  LadingNumber = '';
  Note = '';
  RecipientAddress = '';
  CreatedDate: Date | null = null;
  CreatedBy = '';
  UpdatedDate: Date | null = null;
  UpdatedBy = '';

  constructor(init?: Partial<WarrantyClaim>) {
    Object.assign(this, init);
  }
}
