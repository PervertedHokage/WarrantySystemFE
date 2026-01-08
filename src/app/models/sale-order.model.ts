export class SaleOrder {
  Id = 0;                         
  Quantity = 0;                  
  OrderId = 0;              
  Code = '';
  CustomerName = '';
  CustomerPhoneNumber = '';
  CustomerAddress: string | null = '';
  CustomerEmail: string | null = '';
  DateStart: Date | null = null;
  DateEnd: Date | null = null;
  Price = 0;
  ProductName = '';              
  ProductId = 0;                 
  SerialId: number | null = null; 
  OrderDetailInfoId: number | null = null;
  ProductSerial: string | null = '';
  Imei1: string | null = '';
  Imei2: string | null = '';

  constructor(init?: Partial<SaleOrder>) {
    Object.assign(this, init);
  }
}
