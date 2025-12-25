export class Issues {
  Id = 0;
  Code = '';
  Name: string | null = '';
  IssuesGroupId: number | null = null;
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';
  IsDeleted = false;

    constructor(init?: Partial<Issues>) {
    Object.assign(this, init);
  }
}


export class IssuesGroup {
  Id = 0;
  Code = '';
  Name: string | null = '';
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';
  IsDeleted = false;

    constructor(init?: Partial<IssuesGroup>) {
    Object.assign(this, init);
  }
}