export class QuotationDetailDTO {
  Id: number = 0;
  QuotationId: number | null = null;
  SparePartId: number | null = null;
  SparePartNumber: string = '';
  UnitCode: string = '';
  UnitName: string = '';
  Quantity: number | null = null;
  Price: number | null = null;
  IsDeleted: boolean | null = null;

  constructor(init?: Partial<QuotationDetailDTO>) {
    Object.assign(this, init);
  }
}
