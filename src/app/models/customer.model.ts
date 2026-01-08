export class Customer {
  Id = 0;
  WarrantyClaimId: string | null = '';
  CustomerName = '';
  CustomerEmail: string | null = '';
  CustomerPhoneNumber = '';
  CustomerAddress: string | null = '';
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';

  constructor(init?: Partial<Customer>) {
    Object.assign(this, init);
  }
}
