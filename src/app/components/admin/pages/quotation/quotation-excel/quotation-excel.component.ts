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
import { QuotationService } from '../../../../../services/quotations-service/quotation.service';
import { WarrantyClaimManagementService } from '../../../../../services/warranty-claim-management.service';

@Component({
  selector: 'app-quotation-excel',
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
  templateUrl: './quotation-excel.component.html',
  styleUrl: './quotation-excel.component.less',
})
export class QuotationExcelComponent implements OnInit, AfterViewInit {
  filePath: string = '';
  excelSheets: string[] = [];
  selectedSheet: string = '';
  tableExcel: any;
  dataTableExcel: any[] = [];
  listWarrantyClaim: any[] = [];

  displayProgress: number = 0;
  displayText: string = '0/0';

  totalRowsAfterFileRead: number = 0;
  processedRowsForSave: number = 0;

  isReadingFile: boolean = false;
  isSavingData: boolean = false;
  get isBusy(): boolean {
    return this.isReadingFile || this.isSavingData;
  }

  constructor(
    private notification: NzNotificationService,
    private modalRef: NzModalRef,
    private quotationService: QuotationService,
    private warrantyService: WarrantyClaimManagementService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadWarrantyClaimData();
  }
  ngAfterViewInit(): void {
    this.drawtable();
  }

  loadWarrantyClaimData() {
    this.warrantyService.getWarrantyClaimDropdownData().subscribe({
      next: (res: any) => {
        this.listWarrantyClaim = res.data || [];
      },
    });
  }

  drawtable() {
    if (!this.tableExcel) {
      this.tableExcel = new Tabulator('#datatableExcel', {
        data: this.dataTableExcel,
        layout: 'fitDataFill',
        height: '300px',
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
        autoColumnsDefinitions: {
          STT: {
            title: 'STT',
            field: 'STT',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 50,
            editor: 'input',
          },
          QuotationNumber: {
            title: 'Mã báo giá',
            field: 'QuotationNumber',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          ClaimNo: {
            title: 'Mã yêu cầu',
            field: 'ClaimNo',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerName: {
            title: 'Khách hàng',
            field: 'CustomerName',
            hozAlign: 'left',
            headerHozAlign: 'center',
            editor: 'input',
          },
          CustomerPhoneNumber: {
            title: 'Điện thoại',
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
          StatusQuotation: {
            title: 'Trạng thái',
            field: 'StatusQuotation',
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

      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        this.notification.warning(
          'Thông báo',
          'Vui lòng chọn tệp Excel (.xlsx hoặc .xls)!',
        );
        input.value = '';
        this.resetExcelImportState();
        return;
      }

      this.filePath = file.name;
      this.excelSheets = [];
      this.selectedSheet = '';
      this.dataTableExcel = [];
      this.totalRowsAfterFileRead = 0;
      this.processedRowsForSave = 0;

      this.displayProgress = 0;
      this.displayText = 'Đang đọc file...';

      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.displayProgress = Math.round((event.loaded / event.total) * 100);
          this.displayText = `Đang tải file: ${this.displayProgress}%`;
        }
      };

      let startTime = Date.now();

      reader.onload = async (e: any) => {
        const data = e.target.result;
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);

          this.excelSheets = workbook.worksheets.map((sheet) => sheet.name);

          if (this.excelSheets.length > 0) {
            this.selectedSheet = this.excelSheets[0];
            await this.readExcelData(workbook, this.selectedSheet);

            const elapsedTime = Date.now() - startTime;
            const minDisplayTime = 500;

            if (elapsedTime < minDisplayTime) {
              setTimeout(() => {
                this.displayProgress = 0;
                if (this.totalRowsAfterFileRead === 0) {
                  this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
                } else {
                  this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
                }
              }, minDisplayTime - elapsedTime);
            } else {
              this.displayProgress = 0;
              if (this.totalRowsAfterFileRead === 0) {
                this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
              } else {
                this.displayText = `0/${this.totalRowsAfterFileRead} bản ghi`;
              }
            }
          } else {
            this.notification.warning(
              'Thông báo',
              'File Excel không có sheet nào!',
            );
            this.resetExcelImportState();
          }
        } catch (error) {
          console.error('Lỗi khi đọc tệp Excel:', error);
          this.notification.error(
            'Thông báo',
            `Không thể đọc tệp Excel. Lỗi: ${error instanceof Error ? error.message : 'Định dạng không hợp lệ'}.`,
          );
          this.resetExcelImportState();
        }
        input.value = '';
      };
      reader.readAsArrayBuffer(file);
    }
  }

  private normalizeHeader(raw: any): string {
    const s = (raw ?? '').toString().trim().toLowerCase();
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, ' ');
  }

  private headerSynonymsMap: Record<string, string> = {
    stt: 'STT',
    'so thu tu': 'STT',
    'thu tu': 'STT',
    quotationnumber: 'QuotationNumber',
    'ma bao gia': 'QuotationNumber',
    'so bao gia': 'QuotationNumber',
    claimno: 'ClaimNo',
    'ma yeu cau': 'ClaimNo',
    'ma phieu': 'ClaimNo',
    customername: 'CustomerName',
    'ten khach hang': 'CustomerName',
    'khach hang': 'CustomerName',
    customerphonenumber: 'CustomerPhoneNumber',
    'so dien thoai': 'CustomerPhoneNumber',
    'dien thoai': 'CustomerPhoneNumber',
    customeremail: 'CustomerEmail',
    email: 'CustomerEmail',
    customeraddress: 'CustomerAddress',
    'dia chi': 'CustomerAddress',
    statusquotation: 'StatusQuotation',
    'trang thai': 'StatusQuotation',
    note: 'Note',
    'ghi chu': 'Note',
  };

  private statusMap: Record<string, number> = {
    'đã gửi': 1,
    'chưa gửi': 2,
    'đã duyệt': 3,
    'đã từ chối': 4,
    'hết hạn': 5,
  };

  private getStatusId(value: any): number {
    if (!value) return 2; // Default Chưa gửi
    if (typeof value === 'number') return value;
    const text = String(value).toLowerCase().trim();
    for (const [key, id] of Object.entries(this.statusMap)) {
      if (key === text) return id;
    }
    return 2;
  }

  async readExcelData(workbook: ExcelJS.Workbook, sheetName: string) {
    try {
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) throw new Error(`Sheet "${sheetName}" không tồn tại.`);

      const headerRow = worksheet.getRow(1);
      const columnFieldMap: Record<number, string> = {};

      headerRow.eachCell((cell, colNumber) => {
        const norm = this.normalizeHeader(cell.value);
        const mapped = this.headerSynonymsMap[norm];
        if (mapped) columnFieldMap[colNumber] = mapped;
      });

      if (!columnFieldMap[1]) columnFieldMap[1] = 'STT';

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
          title: 'Mã báo giá',
          field: 'QuotationNumber',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Mã yêu cầu',
          field: 'ClaimNo',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Khách hàng',
          field: 'CustomerName',
          hozAlign: 'left',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Điện thoại',
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
          title: 'Trạng thái',
          field: 'StatusQuotation',
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

      if (this.tableExcel) this.tableExcel.setColumns(columns);

      const data: any[] = [];
      let validRecords = 0;

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData: any = {
          STT: '',
          QuotationNumber: '',
          ClaimNo: '',
          CustomerName: '',
          CustomerPhoneNumber: '',
          CustomerEmail: '',
          CustomerAddress: '',
          StatusQuotation: '',
          Note: '',
        };

        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          const field = columnFieldMap[colIndex];
          if (!field) return;

          const raw = cell.value;
          let value = '';

          if (raw === null || raw === undefined) value = '';
          else if (typeof raw === 'object' && (raw as any).richText)
            value = (raw as any).richText.map((t: any) => t.text).join('');
          else if (typeof (raw as any).text !== 'undefined')
            value = String((raw as any).text).trim();
          else if (typeof (raw as any).result !== 'undefined')
            value = String((raw as any).result).trim();
          else value = String(raw).trim();

          rowData[field] = value;
        });

        if (!rowData.STT) {
          const sttCell = row.getCell(1).value;
          rowData.STT = sttCell
            ? String(sttCell).trim()
            : String(data.length + 1);
        }

        const hasClaimNo = !!(
          rowData.ClaimNo && String(rowData.ClaimNo).trim().length > 0
        );
        const hasQuoteNo = !!(
          rowData.QuotationNumber &&
          String(rowData.QuotationNumber).trim().length > 0
        );
        const isEmptyRow = !hasClaimNo && !hasQuoteNo && !rowData.CustomerName;

        if (!isEmptyRow) {
          data.push(rowData);
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

      if (this.tableExcel) this.tableExcel.replaceData(this.dataTableExcel);
      else this.drawtable();
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
            this.displayProgress = 0;
          } catch (error) {
            this.notification.error(
              'Thông báo',
              'Không thể đọc dữ liệu từ sheet đã chọn!',
            );
            this.resetExcelImportState();
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  downloadTemplate() {
    this.notification.info(
      'Thông báo',
      'Chức năng tải mẫu chưa được cấu hình.',
    );
  }

  saveExcelData() {
    if (!this.dataTableExcel || this.dataTableExcel.length === 0) {
      this.notification.warning('Thông báo', 'Không có dữ liệu để lưu!');
      return;
    }

    const validDataToSave = this.dataTableExcel.filter((row) => {
      const stt = row.STT;
      return (
        typeof stt === 'number' ||
        (typeof stt === 'string' &&
          !isNaN(parseFloat(stt as string)) &&
          isFinite(parseFloat(stt as string)))
      );
    });

    if (validDataToSave.length === 0) {
      this.notification.warning('Thông báo', 'Không có dữ liệu hợp lệ để lưu!');
      return;
    }

    this.isSavingData = true;
    this.processedRowsForSave = 0;
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;

    const saveNext = (index: number) => {
      if (index >= validDataToSave.length) {
        this.displayProgress = 100;
        this.displayText = `${successCount}/${validDataToSave.length} bản ghi`;
        this.isSavingData = false;
        if (failCount === 0)
          this.notification.success(
            'Thông báo',
            `Đã lưu thành công ${successCount} phiếu báo giá!`,
          );
        else
          this.notification.warning(
            'Thông báo',
            `Lưu thành công ${successCount}, thất bại ${failCount} phiếu báo giá!`,
          );
        this.closeExcelModal();
        return;
      }

      const row = validDataToSave[index];
      const claim = this.listWarrantyClaim.find(
        (c) => c.ClaimNo?.toLowerCase() === row.ClaimNo?.toLowerCase(),
      );

      const payload = {
        Id: 0,
        QuotationNumber: row.QuotationNumber || '',
        WarrantyClaimId: claim?.Id || 0,
        CustomerName: row.CustomerName || claim?.CustomerName || '',
        CustomerPhoneNumber:
          row.CustomerPhoneNumber || claim?.CustomerPhoneNumber || '',
        CustomerEmail: row.CustomerEmail || claim?.CustomerEmail || '',
        CustomerAddress: row.CustomerAddress || claim?.CustomerAddress || '',
        StatusQuotation: this.getStatusId(row.StatusQuotation),
        Note: row.Note || '',
        CreatedDate: new Date().toISOString(),
      };

      this.quotationService.save(payload as any).subscribe({
        next: () => {
          successCount++;
          processedCount++;
          this.displayProgress = Math.round(
            (processedCount / validDataToSave.length) * 100,
          );
          this.displayText = `Đang lưu: ${processedCount}/${validDataToSave.length} bản ghi`;
          saveNext(index + 1);
        },
        error: (err) => {
          failCount++;
          processedCount++;
          console.error('Lỗi khi lưu phiếu báo giá:', err);
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

  private resetExcelImportState(): void {
    this.filePath = '';
    this.excelSheets = [];
    this.selectedSheet = '';
    this.dataTableExcel = [];
    this.displayText = '0/0';
    this.displayProgress = 0;
    this.totalRowsAfterFileRead = 0;
    this.processedRowsForSave = 0;
    if (this.tableExcel) this.tableExcel.replaceData([]);
  }

  closeExcelModal() {
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
