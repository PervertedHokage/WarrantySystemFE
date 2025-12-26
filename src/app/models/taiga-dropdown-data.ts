export class TaigaDropdownData {
  Value: number | string | boolean | null = null;
  Name: string | null = null;
  constructor(init?: Partial<TaigaDropdownData>) {
    Object.assign(this, init);
  }
}
