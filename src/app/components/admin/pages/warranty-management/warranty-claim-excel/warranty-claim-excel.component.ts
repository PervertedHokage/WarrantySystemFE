import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import * as ExcelJS from 'exceljs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzModalRef, NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HttpClient } from '@angular/common/http';
import { WarrantyClaimManagementService } from '../../../../../services/warranty-claim-management.service';
import { ProductService } from '../../../../../services/products-service/product.service';

@Component({
  selector: 'app-warranty-claim-excel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule,
    NzIconModule,
    NzButtonModule,
    NzSelectModule,
    NzModalModule,
    NzInputModule,
  ],
  templateUrl: './warranty-claim-excel.component.html',
  styleUrl: './warranty-claim-excel.component.less',
})
export class WarrantyClaimExcelComponent implements OnInit, AfterViewInit {
  filePath: string = '';
  excelSheets: string[] = [];
  selectedSheet: string = '';
  tableExcel: any;
  dataTableExcel: any[] = [];
  listProduct: any[] = [];

  // Biến hiển thị chính trên thanh tiến trình
  displayProgress: number = 0; // % hiển thị trên thanh
  displayText: string = '0/0'; // Text hiển thị trên thanh

  totalRowsAfterFileRead: number = 0; // Tổng số dòng dữ liệu hợp lệ sau khi đọc file
  processedRowsForSave: number = 0; // Số dòng đã được xử lý khi lưu vào DB

  // Chặn đóng modal khi đang xử lý
  isReadingFile: boolean = false;
  isSavingData: boolean = false;
  get isBusy(): boolean {
    return this.isReadingFile || this.isSavingData;
  }

  constructor(
    private notification: NzNotificationService,
    private modalRef: NzModalRef,
    private warrantyService: WarrantyClaimManagementService,
    private productService: ProductService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadProductData();
  }
  ngAfterViewInit(): void {
    this.drawtable();
  }
  drawtable() {
    if (!this.tableExcel) {
      // Chỉ khởi tạo nếu chưa có
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
          STT: {
            title: 'STT',
            field: 'STT',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 50,
            editor: 'input',
          },
          ClaimNo: {
            title: 'Mã phiếu',
            field: 'ClaimNo',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerName: {
            title: 'Tên khách hàng',
            field: 'CustomerName',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerPhoneNumber: {
            title: 'Số điện thoại',
            field: 'CustomerPhoneNumber',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerEmail: {
            title: 'Email',
            field: 'CustomerEmail',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerAddress: {
            title: 'Địa chỉ',
            field: 'CustomerAddress',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          ProductName: {
            title: 'Model',
            field: 'ProductName',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          SerialNumber: {
            title: 'Serial',
            field: 'SerialNumber',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          Note: {
            title: 'Ghi chú',
            field: 'Note',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
        },
      });
    }
  }
  formatProgressText = (percent: number): string => {
    return this.displayText;
  };

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
        this.notification.warning(
          'Thông báo',
          'Vui lòng chọn tệp Excel (.xlsx hoặc .xls)!',
        );
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

          this.excelSheets = workbook.worksheets.map((sheet) => sheet.name);
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
                console.log(
                  'Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật (sau delay).',
                );
              }, minDisplayTime - elapsedTime);
            } else {
              // Nếu quá trình xử lý đã đủ lâu, cập nhật ngay lập tức
              this.displayProgress = 0;
              if (this.totalRowsAfterFileRead === 0) {
                this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
              } else {
                this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
              }
              console.log(
                'Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật.',
              );
            }
          } else {
            console.warn('File Excel không chứa bất kỳ sheet nào.'); // Log
            this.notification.warning(
              'Thông báo',
              'File Excel không có sheet nào!',
            );
            this.resetExcelImportState();
          }
        } catch (error) {
          console.error(
            'Lỗi khi đọc tệp Excel trong FileReader.onload:',
            error,
          ); // Log chi tiết lỗi
          this.notification.error(
            'Thông báo',
            `Không thể đọc tệp Excel. Lỗi: ${error instanceof Error ? error.message : 'Định dạng không hợp lệ'}.`,
          );
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
      .replace(/đ/g, 'd') // chuyển 'đ' -> 'd' để khớp các synonym như 'dvt', 'don vi'
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
    stt: 'STT',
    'so thu tu': 'STT',
    'thu tu': 'STT',
    claimno: 'ClaimNo',
    'ma phieu': 'ClaimNo',
    'so phieu': 'ClaimNo',
    customername: 'CustomerName',
    'ten khach hang': 'CustomerName',
    customer: 'CustomerName',
    customerphonenumber: 'CustomerPhoneNumber',
    'so dien thoai': 'CustomerPhoneNumber',
    customeremail: 'CustomerEmail',
    email: 'CustomerEmail',
    customeraddress: 'CustomerAddress',
    'dia chi': 'CustomerAddress',
    productname: 'ProductName',
    name: 'ProductName',
    'ten san pham': 'ProductName',
    model: 'ProductName',
    serialnumber: 'SerialNumber',
    serial: 'SerialNumber',
    'ma san pham': 'SerialNumber',
    status: 'Status',
    'trang thai': 'Status',
    note: 'Note',
    'ghi chu': 'Note',
  };

  private statusMap: Record<string, number> = {
    'tiếp nhận thông tin': 1,
    'xác minh thông tin': 2,
    'chẩn đoán sơ bộ': 3,
    'báo giá': 4,
    'sửa chữa/bảo hành': 5,
    'hoàn trả': 6,
  };

  private getStatusId(value: any): number {
    if (!value) return 1; // Default New
    if (typeof value === 'number') return value;
    const text = String(value).toLowerCase().trim();
    for (const [key, id] of Object.entries(this.statusMap)) {
      if (key === text) return id;
    }
    return 1; // Default if not found
  }

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

      // Cập nhật lại cột cho phù hợp với dữ liệu hiển thị của Warranty Claim
      const columns = [
        {
          title: 'STT',
          field: 'STT',
          hozAlign: 'center',
          headerHozAlign: 'center',
          width: 50,
          editor: 'input',
        },
        {
          title: 'Mã phiếu',
          field: 'ClaimNo',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Tên khách hàng',
          field: 'CustomerName',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Số điện thoại',
          field: 'CustomerPhoneNumber',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Email',
          field: 'CustomerEmail',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Địa chỉ',
          field: 'CustomerAddress',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Model',
          field: 'ProductName',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Serial',
          field: 'SerialNumber',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Trạng thái',
          field: 'Status',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Ghi chú',
          field: 'Note',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
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
          ClaimNo: '',
          CustomerName: '',
          CustomerPhoneNumber: '',
          CustomerEmail: '',
          CustomerAddress: '',
          ProductName: '',
          SerialNumber: '',
          Status: '',
          Note: '',
        };

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const field = columnFieldMap[colIndex];
          if (!field) return;

          const raw = cell.value;
          let value = '';

          if (raw === null || raw === undefined) {
            value = '';
          } else if (typeof raw === 'object' && (raw as any).richText) {
            value = (raw as any).richText.map((t: any) => t.text).join('');
          } else if (typeof (raw as any).text !== 'undefined') {
            value = String((raw as any).text).trim();
          } else if (typeof (raw as any).result !== 'undefined') {
            value = String((raw as any).result).trim();
          } else {
            value = String(raw).trim();
          }

          rowData[field] = value;
        });

        if (!rowData.STT) {
          const sttCell = row.getCell(1).value;
          rowData.STT = sttCell
            ? String(sttCell).trim()
            : String(data.length + 1);
        }

        // Logic kiểm tra dòng trống có thể khác tùy nghiệp vụ, ở đây tạm dùng ProductName hoặc SerialNumber
        const hasCode = !!(
          rowData.SerialNumber && String(rowData.SerialNumber).trim().length > 0
        );
        const hasName = !!(
          rowData.ProductName && String(rowData.ProductName).trim().length > 0
        );
        const isEmptyRow = !hasCode && !hasName && !rowData.CustomerName; // Mở rộng điều kiện dòng trống

        if (!isEmptyRow) {
          data.push(rowData);
          // Tạm thời coi là hợp lệ nếu có STT hoặc tên sp/serial
          validRecords++;
        }
      }

      this.dataTableExcel = data;
      this.totalRowsAfterFileRead = validRecords;

      this.displayProgress = 0;
      this.displayText =
        this.totalRowsAfterFileRead === 0
          ? 'Không có dữ liệu hợp lệ trong sheet.'
          : `0/${this.totalRowsAfterFileRead} bản ghi`;

      if (this.tableExcel) {
        this.tableExcel.replaceData(this.dataTableExcel);
      } else {
        this.drawtable();
      }
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ sheet:', error);
      this.notification.error(
        'Thông báo',
        `Không thể đọc dữ liệu từ sheet! Lỗi: ${error instanceof Error ? error.message : 'Định dạng không hợp lệ'}.`,
      );
      this.resetExcelImportState();
    }
  }
  onSheetChange() {
    console.log('Sheet đã thay đổi thành:', this.selectedSheet);
    if (this.filePath) {
      const fileInput = document.getElementById(
        'fileInput',
      ) as HTMLInputElement;
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
            this.notification.error(
              'Thông báo',
              'Không thể đọc dữ liệu từ sheet đã chọn!',
            );
            this.resetExcelImportState(); // Reset trạng thái khi có lỗi
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }
  downloadTemplate() {
    //  const url = 'share/template_warranty_claim.xlsx'; // Thay đổi đường dẫn template nếu cần
    //  const a = document.createElement('a');
    //  a.href = url;
    //  a.download = 'template_warranty_claim.xlsx';
    //  a.click();
    this.notification.info(
      'Thông báo',
      'Chức năng tải mẫu chưa được cấu hình.',
    );
  }

  saveExcelData() {
    if (!this.dataTableExcel || this.dataTableExcel.length === 0) {
      this.notification.warning('Thông báo', 'Không có dữ liệu để lưu!');
      console.log('Không có dữ liệu để lưu.');
      return;
    }

    // Lọc dữ liệu để chỉ lấy các dòng có STT là số để xử lý lưu
    const validDataToSave = this.dataTableExcel.filter((row) => {
      const stt = row.STT;
      return (
        typeof stt === 'number' ||
        (typeof stt === 'string' &&
          !isNaN(parseFloat(stt as string)) &&
          isFinite(parseFloat(stt as string)))
      );
    });

    console.log(
      'Số lượng bản ghi hợp lệ để lưu (sau lọc STT số):',
      validDataToSave.length,
    );

    if (validDataToSave.length === 0) {
      this.notification.warning(
        'Thông báo',
        'Không có dữ liệu hợp lệ (STT là số) để lưu!',
      );
      this.displayProgress = 0;
      this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
      return;
    }

    // Reset tiến trình cho giai đoạn lưu dữ liệu
    this.processedRowsForSave = 0;
    const totalProductsToSave = validDataToSave.length;
    this.displayText = `Đang lưu: 0/${totalProductsToSave} bản ghi`;
    this.displayProgress = 0;

    // Không cần gom nhóm phức tạp như Sales Order nếu mỗi dòng là 1 claim độc lập.
    // Nếu cần gom nhóm (ví dụ 1 khách hàng nhiều claim), logic sẽ tương tự Sales Order.
    // Ở đây giả sử mỗi dòng là 1 Warranty Claim riêng biệt.

    // Gọi API lưu từng claim
    this.isSavingData = true;
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;

    const saveNext = (index: number) => {
      if (index >= validDataToSave.length) {
        // Hoàn thành tất cả
        this.displayProgress = 100;
        this.displayText = `${successCount}/${validDataToSave.length} đơn hàng`;
        this.isSavingData = false;

        if (failCount === 0) {
          this.notification.success(
            'Thông báo',
            `Đã lưu thành công ${successCount} phiếu bảo hành!`,
          );
        } else {
          this.notification.warning(
            'Thông báo',
            `Lưu thành công ${successCount}, thất bại ${failCount} phiếu bảo hành!`,
          );
        }
        this.closeExcelModal();
        return;
      }

      const row = validDataToSave[index];
      const product = this.listProduct.find(
        (p) => p.Name?.toLowerCase() === row.ProductName?.toLowerCase(),
      );

      const payload = {
        Id: 0,
        ClaimNo: row.ClaimNo || '',
        CustomerName: row.CustomerName || '',
        CustomerPhoneNumber: row.CustomerPhoneNumber || '',
        CustomerEmail: row.CustomerEmail || '',
        CustomerAddress: row.CustomerAddress || '',
        ProductId: product?.Id || 0,
        ProductName: row.ProductName || '',
        SerialNumber: row.SerialNumber || '',
        Note: row.Note || '',
        Status: this.getStatusId(row.Status),
        CreatedDate: new Date().toISOString(),
      };

      this.warrantyService.create(payload as any).subscribe({
        next: (res: any) => {
          successCount++;
          processedCount++;
          this.displayProgress = Math.round(
            (processedCount / validDataToSave.length) * 100,
          );
          this.displayText = `Đang lưu: ${processedCount}/${validDataToSave.length} bản ghi`;
          saveNext(index + 1);
        },
        error: (err: any) => {
          failCount++;
          processedCount++;
          console.error('Lỗi khi lưu phiếu:', err);
          this.displayProgress = Math.round(
            (processedCount / validDataToSave.length) * 100,
          );
          this.displayText = `Đang lưu: ${processedCount}/${validDataToSave.length} bản ghi`;
          saveNext(index + 1);
        },
      });
    };

    saveNext(0);
  }

  // Load danh sách sản phẩm helper
  private loadProductData() {
    this.productService.getDataProducts().subscribe({
      next: (res: any) => {
        this.listProduct = res.data || [];
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      },
    });
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
      this.notification.warning(
        'Thông báo',
        'Đang nhập dữ liệu, vui lòng đợi hoàn tất!',
      );
      return;
    }
    this.modalRef.close(true);
  }
}
