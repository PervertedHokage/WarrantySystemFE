export class Unit {
  Id: number = 0;
  Code: string = '';
  Name: string = '';
  CreatedDate: Date | string | null = null;
  CreatedBy: string = '';
  UpdatedDate: Date | string | null = null;
  UpdatedBy: string = '';
  IsDeleted: boolean = false;

  constructor(init?: Partial<Unit>) {
    Object.assign(this, init);
  }
}
