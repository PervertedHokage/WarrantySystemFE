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
  HasProtection: boolean | null = null;
  HasAdapter: boolean | null = null;
  HasCable: boolean | null = null;
  HasBattery: boolean | null = null;
  HasIssueWhenOpenBox: boolean | null = null;
  HasCollision: boolean | null = null;
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
