export class SparePart {
  Id: number = 0;
  SparePartGroupId: number | null = null;
  ProductId: number | null = null;
  UnitId: number | null = null;
  SparePartNumber: string | null = null;
  Description: string | null = null;
  Price: number | null = null;
  CreatedDate: Date | string | null = null;
  CreatedBy: string | null = null;
  UpdatedDate: Date | string | null = null;
  UpdatedBy: string | null = null;
  IsDeleted: boolean = false;

  constructor(init?: Partial<SparePart>) {
    Object.assign(this, init);
  }
}
