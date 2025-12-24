export class QuotationDTO {
  Id: number = 0;

  QuotationNumber: string | null = null;

  WarrantyClaimId: number | null = null;

  ClaimNo: string | null = '';

  CustomerName: string | null = null;

  CustomerEmail: string | null = null;

  CustomerPhoneNumber: string | null = null;

  CustomerAddress: string | null = null;

  ProductSerialId: number | null = null;

  ProductName: string | null = null;

  StatusQuotation: number | null = null;

  StatusQuotationText: string | null = null;

  Note: string | null = null;

  DeadLine: Date | null = null;

  CreatedDate: Date | null = null;

  CreatedBy: string | null = null;

  UpdatedDate: Date | null = null;

  UpdatedBy: string | null = null;

  StatusReply: number | null = null;

  StatusReplyText: string | null = null;

  ReplyDate: Date | null = null;

  ReplyNote: string | null = null;

  constructor(init?: Partial<QuotationDTO>) {
    Object.assign(this, init);
  }
}
