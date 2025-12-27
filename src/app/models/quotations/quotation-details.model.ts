export class QuotationDetail {
  Id: number = 0;
  QuotationId: number | null = null;
  SparePartId: number | null = null;
  Quantity: number | null = null;
  Price: number | null = null;
  IsDeleted: boolean | null = null;

  constructor(init?: Partial<QuotationDetail>) {
    Object.assign(this, init);
  }
}
