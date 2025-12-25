export class Product {
  Id = 0;
  Code = '';
  Name: string | null = '';
  Description: string | null = '';
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';
  IsDeleted = false;

    constructor(init?: Partial<Product>) {
    Object.assign(this, init);
  }
}
