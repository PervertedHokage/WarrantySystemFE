export class QuotationDTO {
  Id: number = 0;

  QuotationNumber: string | null = null;

  WarrantyClaimId: number | null = null;

  CustomerName: string | null = null;

  CustomerEmail: string | null = null;

  CustomerPhoneNumber: string | null = null;

  CustomerAddress: string | null = null;

  /**
   * 1 = Đã gửi, 2 = Chưa gửi, 3 = Đã duyệt, 4 = Đã từ chối, 5 = Hết hạn
   */
  StatusQuotation: number | null = null;

  Note: string | null = null;

  StartTime: Date | null = null;

  DeadLine: Date | null = null;

  CreatedDate: Date | null = null;

  CreatedBy: string | null = null;

  UpdatedDate: Date | null = null;

  UpdatedBy: string | null = null;

  StatusReply: number | null = null;

  ReplyDate: Date | null = null;

  ReplyNote: string | null = null;

  Vatfee: number | null = null;

  IsDeleted: boolean | null = null;

  ClaimNo: string | null = null;

  ProductSerialId: number | null = null;

  ProductName: string | null = null;

  StatusQuotationText: string | null = null;

  StatusReplyText: string | null = null;

  constructor(init?: Partial<QuotationDTO>) {
    Object.assign(this, init);
  }
}
