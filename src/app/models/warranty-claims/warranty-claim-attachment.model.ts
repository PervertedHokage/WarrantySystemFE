export class WarrantyClaimAttachment {
  Id: number = 0;
  WarrantyClaimId: number = 0;
  FileName: string = '';
  FilePath: string = '';
  FileSize: number = 0;
  FileType: string = '';
  CreatedDate: Date | null = null;
  CreatedBy: string = '';

  constructor(init?: Partial<WarrantyClaimAttachment>) {
    Object.assign(this, init);
  }
}
