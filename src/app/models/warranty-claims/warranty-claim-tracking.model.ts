export class WarrantyClaimTracking {
  Id!: number;
  WarrantyClaimId!: number;
  StatusText: string | null = null;
  Note: string | null = null;
  IsActive: boolean | null = null;
  CreatedDate: Date = new Date();
  constructor(init?: Partial<WarrantyClaimTracking>) {
    Object.assign(this, init);
  }
}
