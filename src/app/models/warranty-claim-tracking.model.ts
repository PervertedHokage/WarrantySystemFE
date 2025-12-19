export class WarrantyClaimTracking {
  Id!: number;
  WarrantyClaimId!: number;
  StatusText: string | null = null;
  Note: string | null = null;
  IsActive: boolean | null = null;
  CreatedDate: Date | string | null = null;
  constructor(init?: Partial<WarrantyClaimTracking>) {
    Object.assign(this, init);
  }
}
