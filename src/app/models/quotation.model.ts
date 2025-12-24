export class Quotation {
  Id: number = 0;

  QuotationNumber: string | null = null;

  WarrantyClaimId: number | null = null;

  CustomerName: string | null = null;

  CustomerEmail: string | null = null;

  CustomerPhoneNumber: string | null = null;

  CustomerAddress: string | null = null;

  ProductSerialId: number | null = null;

  StatusQuotation: number | null = null;

  Note: string | null = null;

  DeadLine: Date | null = null;

  CreatedDate: Date | null = null;

  CreatedBy: string | null = null;

  UpdatedDate: Date | null = null;

  UpdatedBy: string | null = null;

  StatusReply: number | null = null;

  ReplyDate: Date | null = null;

  ReplyNote: string | null = null;

  constructor(init?: Partial<Quotation>) {
    Object.assign(this, init);
  }
}
