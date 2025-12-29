export class Quotation {
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

  StartTime: Date | string | null = new Date();

  DeadLine: Date | string | null = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  CreatedDate: Date | string | null = null;

  CreatedBy: string | null = null;

  UpdatedDate: Date | string | null = null;

  UpdatedBy: string | null = null;

  StatusReply: number | null = null;

  ReplyDate: Date | string | null = null;

  ReplyNote: string | null = null;

  Vatfee: number = 0;

  IsDeleted: boolean | null = null;

  constructor(init?: Partial<Quotation>) {
    Object.assign(this, init);
  }
}
