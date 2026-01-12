export class CheckStatusBySerialResult {
  STT!: number;

  CustomerName!: string;

  CustomerPhoneNumber!: string;

  CustomerAddress!: string;

  CustomerEmail!: string;

  ProductName!: string;

  ProductSerial!: string;

  IMEI1!: string;

  IMEI2!: string;

  Quantity!: number;

  Price!: number;

  DateStart!: Date | null;

  DateEnd!: Date | null;

  constructor(init?: Partial<CheckStatusBySerialResult>) {
    Object.assign(this, init);
  }
}
