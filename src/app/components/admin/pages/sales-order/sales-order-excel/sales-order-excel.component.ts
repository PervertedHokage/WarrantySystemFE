import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import * as ExcelJS from 'exceljs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalService, NzModalModule, NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { HttpClient } from '@angular/common/http';
import { SaleOrder } from '../../../../../models/sale-order.model';
import { SalesOrderService } from '../../../../../services/sales-order-service/sales-order.service';
import { ProductService } from '../../../../../services/products-service/product.service';

@Component({
  selector: 'app-import-excel-product-sale',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzProgressModule, NzIconModule, NzButtonModule],
  templateUrl: './sales-order-excel.component.html',
  styleUrl: './sales-order-excel.component.less'
})
export class ImportExcelProductSaleComponent implements OnInit, AfterViewInit {

  wareHouseCode: string = "HN";
  filePath: string = '';
  excelSheets: string[] = [];
  selectedSheet: string = '';
  tableExcel: any;
  dataTableExcel: any[] = [];
  listProduct: any[] = [];
  listImei1: any[] = [];
  listProductGroup: any[] = [];
  listLocation: any[] = [];


  // Biến hiển thị chính trên thanh tiến trình
  displayProgress: number = 0; // % hiển thị trên thanh
  displayText: string = '0/0'; // Text hiển thị trên thanh

  totalRowsAfterFileRead: number = 0; // Tổng số dòng dữ liệu hợp lệ sau khi đọc file
  processedRowsForSave: number = 0; // Số dòng đã được xử lý khi lưu vào DB

  // Chặn đóng modal khi đang xử lý
  isReadingFile: boolean = false;
  isSavingData: boolean = false;
  get isBusy(): boolean { return this.isReadingFile || this.isSavingData; }

  constructor(
    private notification: NzNotificationService,
    private modalRef: NzModalRef,
    private saleorderService: SalesOrderService,
    private productService: ProductService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUnitAndImei1Data();
  }
  ngAfterViewInit(): void {
    this.drawtable();
  }
  drawtable() {
    if (!this.tableExcel) { // Chỉ khởi tạo nếu chưa có
      this.tableExcel = new Tabulator('#datatableExcel', {
        data: this.dataTableExcel, // Dữ liệu ban đầu rỗng
        layout: 'fitDataFill',
        height: '300px', // Chiều cao cố định cho bảng trong modal
        selectableRows: 10,
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        autoColumns: true,
        langs: {
          vi: {
            pagination: {
              first: '<<',
              last: '>>',
              prev: '<',
              next: '>',
            },
          },
        },
        locale: 'vi',
        // Tự động tạo cột dựa trên dữ liệu
        autoColumnsDefinitions: {
          STT: { title: "STT", field: "STT", hozAlign: "center", headerHozAlign: "center", width: 50, editor: "input" },
          CustomerName: { title: 'Tên khách hàng', field: 'CustomerName', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          CustomerPhoneNumber: { title: 'Số điện thoại', field: 'CustomerPhoneNumber', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          CustomerEmail: { title: 'Email', field: 'CustomerEmail', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          ProductName: { title: 'Tên nhóm', field: 'ProductName', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          Serial: { title: 'Mã Sản phẩm', field: 'Serial', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          // ProductName: { title: 'Tên Sản phẩm', field: 'ProductName', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          Imei1: { title: 'Imei1', field: 'Imei1', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          // Unit: { title: 'ĐVT', field: 'Unit', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          Imei2: { title: 'Imei2', field: 'Imei2', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          Price: { title: 'Giá', field: 'Price', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          Quantity: { title: 'Số lượng', field: 'Quantity', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          DateStart: { title: 'Ngày kích hoạt', field: 'DateStart', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          DateEnd: { title: 'Hạn bảo hành', field: 'DateEnd', hozAlign: 'left', headerHozAlign: 'center', editor: "input" },
          // Note: { title: 'Ghi chú', field: 'Note', hozAlign: 'left', headerHozAlign: 'center', editor: "input" }
        }
      });
    }
  }
  formatProgressText = (percent: number): string => {
    return this.displayText;
  }

  openFileExplorer() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      console.log('File đã chọn:', file.name); // Log để kiểm tra
      console.log('Phần mở rộng:', fileExtension); // Log để kiểm tra

      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        this.notification.warning('Thông báo', 'Vui lòng chọn tệp Excel (.xlsx hoặc .xls)!');
        input.value = ''; // Xóa input để có thể chọn lại file
        this.resetExcelImportState(); // Reset trạng thái khi có lỗi định dạng
        return;
      }

      this.filePath = file.name;
      this.excelSheets = [];
      this.selectedSheet = '';
      this.dataTableExcel = [];
      this.totalRowsAfterFileRead = 0;
      this.processedRowsForSave = 0; // Reset cho giai đoạn lưu

      // Đặt trạng thái ban đầu cho thanh tiến trình: Đang đọc file
      this.displayProgress = 0;
      this.displayText = 'Đang đọc file...';
      console.log('Progress bar state set to: Đang đọc file...'); // Log trạng thái ban đầu

      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.displayProgress = Math.round((event.loaded / event.total) * 100);
          this.displayText = `Đang tải file: ${this.displayProgress}%`;
          // console.log(`Tiến trình đọc file: ${this.displayProgress}%`); // Bỏ comment nếu muốn log chi tiết tiến trình tải
        }
      };

      let startTime = Date.now(); // Ghi lại thời gian bắt đầu đọc file

      reader.onload = async (e: any) => {
        const data = e.target.result;
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);
          console.log('Workbook đã được tải bởi ExcelJS.'); // Log

          this.excelSheets = workbook.worksheets.map(sheet => sheet.name);
          console.log('Danh sách sheets tìm thấy:', this.excelSheets); // Log

          if (this.excelSheets.length > 0) {
            this.selectedSheet = this.excelSheets[0];
            console.log('Sheet mặc định được chọn:', this.selectedSheet); // Log
            await this.readExcelData(workbook, this.selectedSheet);

            const elapsedTime = Date.now() - startTime;
            const minDisplayTime = 500; // Thời gian hiển thị tối thiểu cho trạng thái tải (500ms)

            if (elapsedTime < minDisplayTime) {
              // Nếu quá trình xử lý nhanh hơn thời gian tối thiểu, đợi thêm
              setTimeout(() => {
                this.displayProgress = 0; // Luôn hiển thị 0% cho trạng thái "0/tổng số dòng"
                if (this.totalRowsAfterFileRead === 0) {
                  this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
                } else {
                  this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
                }
                console.log('Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật (sau delay).');
              }, minDisplayTime - elapsedTime);
            } else {
              // Nếu quá trình xử lý đã đủ lâu, cập nhật ngay lập tức
              this.displayProgress = 0;
              if (this.totalRowsAfterFileRead === 0) {
                this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
              } else {
                this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
              }
              console.log('Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật.');
            }

          } else {
            console.warn('File Excel không chứa bất kỳ sheet nào.'); // Log
            this.notification.warning('Thông báo', 'File Excel không có sheet nào!');
            this.resetExcelImportState();
          }
        } catch (error) {
          console.error('Lỗi khi đọc tệp Excel trong FileReader.onload:', error); // Log chi tiết lỗi
          this.notification.error('Thông báo', 'Không thể đọc tệp Excel. Vui lòng đảm bảo tệp không bị hỏng và đúng định dạng.');
          this.resetExcelImportState(); // Reset trạng thái khi có lỗi
        }
        input.value = ''; // Xóa input để có thể chọn lại cùng file
      };
      reader.readAsArrayBuffer(file); // Bắt đầu đọc file ngay lập tức
    }
  }
  private normalizeHeader(raw: any): string {
    const s = (raw ?? '').toString().trim().toLowerCase();
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')  // chuyển 'đ' -> 'd' để khớp các synonym như 'dvt', 'don vi'
      .replace(/\s+/g, ' ');
  }

  // Chuyển Excel serial number sang Date
  private excelSerialToDate(serial: number): Date {
    // Excel epoch bắt đầu từ 1/1/1900 (nhưng có bug leap year 1900)
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  }

  // Format Date thành chuỗi dd/MM/yyyy
  private formatDate(date: Date): string {
    if (!date || isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Format giá tiền với dấu phân cách hàng nghìn và đơn vị đ
  private formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '0 đ';
    const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return '0 đ';
    return num.toLocaleString('vi-VN') + ' đ';
  }

  private headerSynonymsMap: Record<string, string> = {
    'stt': 'STT', 'so thu tu': 'STT', 'thu tu': 'STT',
    'customername': 'CustomerName', 'ten khach hang': 'CustomerName', 'customer': 'CustomerName',
    'customerphonenumber': 'CustomerPhoneNumber', 'so dien thoai': 'CustomerPhoneNumber',
    'customeremail': 'CustomerEmail', 'email': 'CustomerEmail',
    'customeraddress': 'CustomerAddress', 'dia chi': 'CustomerAddress',
    'productname': 'ProductName', 'name': 'ProductName', 'ten san pham': 'ProductName', 'model': 'ProductName',
    'serial': 'Serial', 'ma san pham': 'Serial',
    'imei1': 'Imei1', 'imei 1': 'Imei1',
    'imei2': 'Imei2', 'imei 2': 'Imei2',
    'price': 'Price', 'gia': 'Price',
    'quantity': 'Quantity', 'so luong': 'Quantity',
    'datestart': 'DateStart', 'ngay kich hoat': 'DateStart',
    'dateend': 'DateEnd', 'han bao hanh': 'DateEnd',
  };

  async readExcelData(workbook: ExcelJS.Workbook, sheetName: string) {
    try {
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" không tồn tại.`);
      }

      const headerRow = worksheet.getRow(1);
      const columnFieldMap: Record<number, string> = {};

      headerRow.eachCell((cell, colNumber) => {
        const norm = this.normalizeHeader(cell.value);
        const mapped = this.headerSynonymsMap[norm];
        if (mapped) {
          columnFieldMap[colNumber] = mapped;
        }
      });

      if (!columnFieldMap[1]) {
        columnFieldMap[1] = 'STT';
      }

      const columns = [
        { title: 'STT', field: 'STT', hozAlign: 'center', headerHozAlign: "center", width: 50, editor: "input" },
        { title: 'Tên khách hàng', field: 'CustomerName', hozAlign: 'left', headerHozAlign: "center", width: 200, editor: "input" },
        { title: 'Số điện thoại', field: 'CustomerPhoneNumber', hozAlign: 'left', headerHozAlign: "center", width: 150, editor: "input" },
        { title: 'Email', field: 'CustomerEmail', hozAlign: 'left', headerHozAlign: "center", width: 150, editor: "input" },
        { title: 'Địa chỉ', field: 'CustomerAddress', hozAlign: 'left', headerHozAlign: "center", width: 150, editor: "input" },
        { title: 'Model', field: 'ProductName', hozAlign: 'left', headerHozAlign: "center", width: 200, editor: "input" },
        { title: 'Serial', field: 'Serial', hozAlign: 'left', headerHozAlign: "center", width: 150, editor: "input" },
        { title: 'Imei1', field: 'Imei1', hozAlign: 'left', headerHozAlign: 'center', width: 120, editor: "input" },
        { title: 'Imei2', field: 'Imei2', hozAlign: 'left', headerHozAlign: "center", width: 120, editor: "input" },
        { title: 'Giá', field: 'Price', hozAlign: 'right', headerHozAlign: 'center', width: 150, formatter: (cell: any) => this.formatCurrency(cell.getValue()), editor: "input" },
        { title: 'Số lượng', field: 'Quantity', hozAlign: 'right', headerHozAlign: 'center', width: 100, editor: "input" },
        { title: 'DateStart', field: 'DateStart', hozAlign: 'left', headerHozAlign: 'center', width: 200, editor: "input" },
        { title: 'DateEnd', field: 'DateEnd', hozAlign: 'left', headerHozAlign: 'center', width: 200, editor: "input" },
        // { title: 'Ghi chú', field: 'Note', hozAlign: 'left', headerHozAlign: 'center', width: 120, editor: "input" }
      ];

      if (this.tableExcel) {
        this.tableExcel.setColumns(columns);
      }

      const data: any[] = [];
      let validRecords = 0;

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData: any = {
          STT: '',
          CustomerName: '',
          CustomerPhoneNumber: '',
          CustomerEmail: '',
          CustomerAddress: '',
          ProductName: '',
          Price: '',
          Quantity: '',
          Serial: '',
          Imei1: '',
          Imei2: '',
          DateStart: '',
          DateEnd: '',
          // Note: ''
        };

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const field = columnFieldMap[colIndex];
          if (!field) return;

          const raw = cell.value;
          let value = '';

          // Xử lý đặc biệt cho các trường ngày tháng
          if (field === 'DateStart' || field === 'DateEnd') {
            if (raw instanceof Date) {
              // Nếu là Date object, format thành dd/MM/yyyy
              value = this.formatDate(raw);
            } else if (typeof raw === 'number') {
              // Nếu là số (Excel serial number), chuyển sang Date rồi format
              const date = this.excelSerialToDate(raw);
              value = this.formatDate(date);
            } else if (raw && typeof raw === 'string') {
              // Nếu là string, giữ nguyên hoặc parse
              value = raw.trim();
            } else {
              value = '';
            }
          } else if (raw === null || raw === undefined) {
            value = '';
          } else if (typeof raw === 'object' && (raw as any).richText) {
            value = (raw as any).richText.map((t: any) => t.text).join('');
          } else if (typeof (raw as any).text !== 'undefined') {
            value = String((raw as any).text).trim();
          } else {
            value = String(raw).trim();
          }

          rowData[field] = value;
        });

        if (!rowData.STT) {
          const sttCell = row.getCell(1).value;
          rowData.STT = sttCell ? String(sttCell).trim() : String(data.length + 1);
        }

        if (!rowData.ProductGroup && rowData.ProductName) {
          rowData.ProductGroup = rowData.ProductName;
        }

        const hasCode = !!(rowData.Serial && String(rowData.Serial).trim().length > 0);
        const hasName = !!(rowData.ProductName && String(rowData.ProductName).trim().length > 0);
        const isEmptyRow = !hasCode && !hasName;

        if (!isEmptyRow) {
          data.push(rowData);
          if (hasCode && hasName) {
            validRecords++;
          }
        }
      }

      this.dataTableExcel = data;
      this.totalRowsAfterFileRead = validRecords;

      this.displayProgress = 0;
      this.displayText = this.totalRowsAfterFileRead === 0
        ? 'Không có dữ liệu hợp lệ trong sheet.'
        : `0/${this.totalRowsAfterFileRead} bản ghi`;

      if (this.tableExcel) {
        this.tableExcel.replaceData(this.dataTableExcel);
      } else {
        this.drawtable();
      }
    } catch (error) {
      this.notification.error('Thông báo', 'Không thể đọc dữ liệu từ sheet! Vui lòng kiểm tra định dạng dữ liệu.');
      this.resetExcelImportState();
    }
  }
  onSheetChange() {
    console.log('Sheet đã thay đổi thành:', this.selectedSheet);
    if (this.filePath) {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const data = e.target.result;
          try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
            await this.readExcelData(workbook, this.selectedSheet);
            // Sau khi thay đổi sheet và đọc dữ liệu, đặt lại thanh tiến trình
            this.displayProgress = 0;
            // displayText được cập nhật trong readExcelData
            console.log('Dữ liệu đã được đọc lại sau khi thay đổi sheet.'); // Log
          } catch (error) {
            console.error('Lỗi khi đọc tệp Excel khi thay đổi sheet:', error);
            this.notification.error('Thông báo', 'Không thể đọc dữ liệu từ sheet đã chọn!');
            this.resetExcelImportState(); // Reset trạng thái khi có lỗi
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }
  downloadTemplate() {
    const url = 'share/template_sale_order.xlsx';
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_sale_order.xlsx';
    a.click();
  }

  saveExcelData() {
    if (!this.dataTableExcel || this.dataTableExcel.length === 0) {
      this.notification.warning('Thông báo', 'Không có dữ liệu để lưu!');
      console.log('Không có dữ liệu để lưu.');
      return;
    }

    // Lọc dữ liệu để chỉ lấy các dòng có STT là số để xử lý lưu
    const validDataToSave = this.dataTableExcel.filter(row => {
      const stt = row.STT;
      return typeof stt === 'number' || (typeof stt === 'string' && !isNaN(parseFloat(stt as string)) && isFinite(parseFloat(stt as string)));
    });

    console.log('Số lượng bản ghi hợp lệ để lưu (sau lọc STT số):', validDataToSave.length);

    if (validDataToSave.length === 0) {
      this.notification.warning('Thông báo', 'Không có dữ liệu hợp lệ (STT là số) để lưu!');
      this.displayProgress = 0;
      this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
      return;
    }

    // Reset tiến trình cho giai đoạn lưu dữ liệu
    this.processedRowsForSave = 0;
    const totalProductsToSave = validDataToSave.length;
    this.displayText = `Đang lưu: 0/${totalProductsToSave} bản ghi`;
    this.displayProgress = 0;

    // Gom nhóm theo khách hàng (dựa trên CustomerPhoneNumber hoặc CustomerName)
    const groupedByCustomer = new Map<string, any[]>();

    validDataToSave.forEach(row => {
      // Sử dụng CustomerPhoneNumber làm key để gom nhóm, fallback sang CustomerName
      const customerKey = (row.CustomerPhoneNumber || row.CustomerName || 'unknown').trim();
      if (!groupedByCustomer.has(customerKey)) {
        groupedByCustomer.set(customerKey, []);
      }
      groupedByCustomer.get(customerKey)!.push(row);
    });

    // Tạo payload theo cấu trúc backend
    const payloads: any[] = [];

    groupedByCustomer.forEach((rows, customerKey) => {
      const firstRow = rows[0];

      // Tạo Order object
      const order = {
        Id: 0,
        CustomerName: firstRow.CustomerName || '',
        CustomerPhoneNumber: firstRow.CustomerPhoneNumber || '',
        CustomerAddress: firstRow.CustomerAddress || '',
        CustomerEmail: firstRow.CustomerEmail || '',
        CreatedDate: new Date().toISOString(),
        CreatedBy: '',
        UpdatedDate: new Date().toISOString(),
        UpdatedBy: '',
        IsDeleted: false
      };

      // Tạo SaleOrderDetailDTO array
      const saleOrderDetailDTO = rows.map((row, index) => {
        // Tìm ProductId từ listProduct dựa trên ProductName
        const product = this.listProduct.find(p =>
          p.Name?.toLowerCase() === row.ProductName?.toLowerCase()
        );
        const productId = product?.Id || 0;

        // Parse ngày từ string dd/MM/yyyy sang ISO format
        const dateStart = this.parseDate(row.DateStart);
        const dateEnd = this.parseDate(row.DateEnd);

        return {
          OrderDetails: {
            Id: 0,
            OrderId: 0,
            Stt: index + 1,
            ProductId: productId,
            Quantity: 1,
            CreatedDate: new Date().toISOString(),
            CreatedBy: '',
            UpdatedDate: new Date().toISOString(),
            UpdatedBy: '',
            IsDeleted: false,
            DateStart: dateStart,
            DateEnd: dateEnd,
            Code: '',
            Price: 0,
            Imei1: row.Imei1 || '',
            Imei2: row.Imei2 || ''
          },
          OrderDetailInfo: [
            {
              Id: 0,
              OrderDetailId: 0,
              ProductSerial: row.Serial || '',
              CreatedDate: new Date().toISOString(),
              CreatedBy: '',
              UpdatedDate: new Date().toISOString(),
              UpdatedBy: '',
              IsDeleted: false
            }
          ]
        };
      });

      payloads.push({
        Order: order,
        SaleOrderDetailDTO: saleOrderDetailDTO,
        DeletedOrder: []
      });
    });

    console.log('Payload gửi đi:', payloads);

    // Gọi API lưu từng order
    this.isSavingData = true;
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;

    const saveNext = (index: number) => {
      if (index >= payloads.length) {
        // Hoàn thành tất cả
        this.displayProgress = 100;
        this.displayText = `${successCount}/${payloads.length} đơn hàng`;
        this.isSavingData = false;

        if (failCount === 0) {
          this.notification.success('Thông báo', `Đã lưu thành công ${successCount} đơn hàng!`);
        } else {
          this.notification.warning('Thông báo', `Lưu thành công ${successCount}, thất bại ${failCount} đơn hàng!`);
        }
        this.closeExcelModal();
        return;
      }

      this.saleorderService.saveDataSaleOder(payloads[index]).subscribe({
        next: (res: any) => {
          successCount++;
          processedCount++;
          this.displayProgress = Math.round((processedCount / payloads.length) * 100);
          this.displayText = `Đang lưu: ${processedCount}/${payloads.length} đơn hàng`;
          saveNext(index + 1);
        },
        error: (err: any) => {
          failCount++;
          processedCount++;
          console.error('Lỗi khi lưu đơn hàng:', err);
          this.displayProgress = Math.round((processedCount / payloads.length) * 100);
          this.displayText = `Đang lưu: ${processedCount}/${payloads.length} đơn hàng`;
          saveNext(index + 1);
        }
      });
    };

    saveNext(0);
  }

  // Parse ngày từ string dd/MM/yyyy sang ISO format
  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    // Nếu đã là ISO format
    if (dateStr.includes('T') || dateStr.includes('-')) {
      return new Date(dateStr).toISOString();
    }

    // Parse từ dd/MM/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  }
  showSaveSummary(successCount: number, errorCount: number, totalProducts: number) {
    console.log('--- Hiển thị tóm tắt kết quả lưu ---');
    console.log(`Tổng sản phẩm: ${totalProducts}, Thành công: ${successCount}, Thất bại: ${errorCount}`);

    if (errorCount === 0) {
      this.notification.success('Thông báo', `Đã lưu ${successCount} sản phẩm thành công`);
    } else if (successCount === 0) {
      this.notification.error('Thông báo', `Lưu thất bại ${errorCount}/${totalProducts} sản phẩm`);
    } else {
      this.notification.warning('Thông báo', `Đã lưu ${successCount} sản phẩm thành công, ${errorCount} sản phẩm thất bại`);
    }
    this.closeExcelModal();
  }
  // Hàm helper để lấy ID của đơn vị tính từ tên
  private getUnitIdByName(unitName: string): number {
    const unit = this.listProduct.find(u => u.Name === unitName);
    return unit ? unit.Id : 0;
  }

  // Hàm helper để lấy ID của hãng từ tên
  private getFirmIdByName(firmName: string): number {
    const firm = this.listImei1.find(f => f.Imei1Name === firmName);
    console.log('Kết quả tìm kiếm:', firm);
    return firm ? firm.ID : 0;
  }

  // Hàm helper để lấy ID của ProductGroup từ tên
  private getProductGroupIdByName(groupName: string): number {
    const group = this.listProductGroup.find(g => g.ProductName === groupName);
    return group ? group.ID : 0;
  }

  // Hàm helper để lấy ID của Location từ tên
  private getLocationIdByName(Imei2: string): number {
    const location = this.listLocation.find(l => l.Imei2 === Imei2);
    return location ? location.ID : 0;
  }

  // Hàm để lấy danh sách đơn vị, ProductGroup và Location
  private loadUnitAndImei1Data() {
    this.productService.getDataProducts().subscribe({
      next: (res: any) => {
        this.listProduct = res.data || [];
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      }
    });

    //   this.saleorderService.getdataProductGroup(this.wareHouseCode, false).subscribe({
    //     next: (res: any) => {
    //       this.listProductGroup = res.data || [];
    //     },
    //     error: (err: any) => {
    //       console.error('Lỗi khi lấy danh sách nhóm sản phẩm:', err);
    //     }
    //   });

    //   this.saleorderService.getDataLocation(0).subscribe({
    //     next: (res: any) => {
    //       this.listLocation = res.data || [];
    //     },
    //     error: (err: any) => {
    //       console.error('Lỗi khi lấy danh sách vị trí:', err);
    //     }
    //   });

    //   this.saleorderService.getDataFirm().subscribe({
    //     next: (res: any) => {
    //       this.listImei1 = res.data || [];
    //     },
    //     error: (err: any) => {
    //       console.error('Lỗi khi lấy danh sách hãng:', err);
    //     }
    //   });
  }

  // Hàm mới để reset trạng thái nhập Excel
  private resetExcelImportState(): void {
    this.filePath = '';
    this.excelSheets = [];
    this.selectedSheet = '';
    this.dataTableExcel = [];
    this.displayText = '0/0';
    this.displayProgress = 0;
    this.totalRowsAfterFileRead = 0;
    this.processedRowsForSave = 0;

    if (this.tableExcel) {
      this.tableExcel.replaceData([]); // Xóa dữ liệu trong Tabulator preview
    }
    console.log('Trạng thái nhập Excel đã được reset.'); // Log
  }

  closeExcelModal() {
    // Chặn đóng khi đang đọc/lưu
    if (this.isBusy) {
      this.notification.warning('Thông báo', 'Đang nhập dữ liệu, vui lòng đợi hoàn tất!');
      return;
    }
    this.modalRef.close(true);
  }
}
