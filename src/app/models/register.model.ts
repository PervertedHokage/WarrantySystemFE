export class Register {
  Id = 0;
  Code = '';
  LoginName: string | null = '';
  PasswordHash: string | null = '';
  FullName: string | null = '';
  Email: string | null = '';
  Telephone: string | null = '';
  IsAdmin: boolean = false;
  CreatedDate: Date | null = null;
  CreatedBy: string | null = '';
  UpdatedDate: Date | null = null;
  UpdatedBy: string | null = '';

    constructor(init?: Partial<Register>) {
    Object.assign(this, init);
  }
}
