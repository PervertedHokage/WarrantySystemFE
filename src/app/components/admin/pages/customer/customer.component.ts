import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
} from '@angular/core';
import {
  AngularSlickgridModule,
  Column,
  Filters,
  Formatters,
  GridOption,
} from 'angular-slickgrid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFlexModule, NzWrap } from 'ng-zorro-antd/flex';
import { NzDrawerModule, NzDrawerPlacement } from 'ng-zorro-antd/drawer';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ReactiveFormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { TemplateRef } from '@angular/core';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../../../../app/app.config';
import { CustomerService } from '../../../../../app/services/customer-service/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    AngularSlickgridModule,
    NzCardModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzRadioModule,
    NzSpaceModule,
    NzLayoutModule,
    NzFlexModule,
    NzDrawerModule,
    NzSplitterModule,
    NzGridModule,
    NzDatePickerModule,
    NzAutocompleteModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzInputNumberModule,
    ReactiveFormsModule,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.less',
})
export class CustomerComponent implements OnInit, AfterViewInit {
  @ViewChild('unitFormTpl', { static: true }) unitFormTpl!: TemplateRef<any>;

  columnCustomer: Column[] = [];
  gridOptionCustomer: GridOption = {};
  datasetCustomer: any[] = [];

  isCheckmode: boolean = false;
  CustomerID: number = 0;

  angularGrid: any;
  dataView: any;

  CustomerData: any;
  formGroup: FormGroup;
  private unitModalRef: NzModalRef | null = null;

  ngOnInit(): void {
    this.defineGrid();
    this.getCustomer();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private customerService: CustomerService,
    private modal: NzModalService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      CustomerName: ['', [Validators.required, Validators.maxLength(50)]],
      CustomerEmail: ['', [Validators.required, Validators.maxLength(50)]],
      CustomerPhoneNumber: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],
      CustomerAddress: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }
  filterOption = (input: string, option: any): boolean => {
    if (!input) return true;
    const searchText = input.toLowerCase();
    const label = option.nzLabel?.toLowerCase() || '';
    return label.includes(searchText);
  };

  onCancelUnit(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.unitModalRef?.destroy(false);
  }

  defineGrid() {
    this.columnCustomer = [
      {
        id: 'stt',
        name: 'STT',
        field: 'stt',
        width: 50,
        minWidth: 50,
        maxWidth: 60,
        sortable: false,
        filterable: false,
        formatter: (row) => {
          // STT động dựa trên số thứ tự dòng (bắt đầu từ 1)
          return row !== undefined && row !== null ? (row + 1).toString() : '';
        },
        type: 'string',
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Code',
        name: 'Mã khách hàng',
        field: 'Code',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerName',
        name: 'Tên khách hàng',
        field: 'CustomerName',
        sortable: true,
        minWidth: 100,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerEmail',
        name: 'Email',
        field: 'CustomerEmail',
        minWidth: 100,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerPhoneNumber',
        name: 'Số điện thoại',
        field: 'CustomerPhoneNumber',
        minWidth: 100,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerAddress',
        name: 'Địa chỉ',
        field: 'CustomerAddress',
        minWidth: 100,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptionCustomer = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-customer-container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      checkboxSelector: {
        hideSelectAllCheckbox: false,
      },
      multiSelect: true,
      rowSelectionOptions: { selectActiveRow: false },
      datasetIdPropertyName: 'Id',
      enableCellNavigation: true,

      enableAddRow: false,
    };
  }

  gridReady(e: any) {
    this.angularGrid = e.detail || e;
    this.dataView = this.angularGrid?.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.CustomerID = 0;
      this.CustomerData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.CustomerID = dataContext?.Id ?? 0;
    this.CustomerData = dataContext || null;
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.CustomerID = 0;
      this.CustomerData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.CustomerID = item?.Id ?? 0;
    this.CustomerData = item || null;
  }

  getCustomer() {
    this.customerService.getDataCustomers().subscribe((response: any) => {
      this.datasetCustomer = response?.data || [];
    });
  }

  onAddCustomer(isEditMode: boolean) {
    this.isCheckmode = isEditMode;
    if (this.isCheckmode == true && this.CustomerID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }

    if (this.isCheckmode) {
      this.formGroup.reset({
        CustomerName: this.CustomerData?.CustomerName || '',
        CustomerEmail: this.CustomerData?.CustomerEmail || '',
        CustomerPhoneNumber: this.CustomerData?.CustomerPhoneNumber || '',
        CustomerAddress: this.CustomerData?.CustomerAddress || '',
      });
    } else {
      this.formGroup.reset({
        CustomerName: '',
        CustomerEmail: '',
        CustomerPhoneNumber: '',
        CustomerAddress: '',
      });
    }

    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode ? 'Sửa khách hàng' : 'Thêm khách hàng',
      nzContent: this.unitFormTpl,
      nzFooter: null,
      nzWidth: 'min(90vw, 1000px)',
      nzMaskClosable: false,
      nzKeyboard: false,
    });

    this.unitModalRef = modalRef;

    modalRef.afterClose.subscribe((result) => {
      this.unitModalRef = null;
      if (result === true) {
        // Reload cả master và detail
        this.getCustomer();
      }
    });
  }
  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

  saveData() {
    this.trimAllStringControls();
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng kiểm tra lại dữ liệu nhập!'
      );
      return;
    }
    const customerPayload = this.formGroup.value;
    const payload = {
      Id: this.isCheckmode ? this.CustomerID : 0,
      CustomerName: customerPayload.CustomerName,
      CustomerEmail: customerPayload.CustomerEmail,
      CustomerPhoneNumber: customerPayload.CustomerPhoneNumber,
      CustomerAddress: customerPayload.CustomerAddress,
    };
    this.customerService.saveDataCustomer(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isCheckmode
            ? 'Cập nhật thành công!'
            : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.unitModalRef?.destroy(true);
          this.getCustomer();
        } else {
          this.notification.warning(
            'Thông báo',
            res.message || 'Không thể lưu dữ liệu!'
          );
        }
      },
      error: (err) => {
        this.notification.error(
          'Thông báo',
          err?.error?.message || err.message || 'Có lỗi xảy ra khi lưu!'
        );
      },
    });
  }

   onDeleteCustomer() {
      if (!this.angularGrid) {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Grid chưa được khởi tạo!'
        );
        return;
      }
  
      const gridService = this.angularGrid.gridService;
      const dataView = this.angularGrid.dataView;
  
      const selectedRowsFromSlickGrid =
        this.angularGrid?.slickGrid?.getSelectedRows?.() || [];
  
      let selectedItems: any[] = [];
  
      if (gridService && gridService.getSelectedRows) {
        const selectedRows =
          gridService.getSelectedRows() || selectedRowsFromSlickGrid;
        selectedItems = selectedRows
          .map((idx: number) => dataView.getItem(idx))
          .filter((item: any) => item);
      } else if (dataView && dataView.getSelectedIds) {
        const selectedIds = dataView.getSelectedIds();
        selectedItems = selectedIds
          .map((id: any) => dataView.getItemById(id))
          .filter((item: any) => item);
      } else if (selectedRowsFromSlickGrid.length && dataView) {
        selectedItems = selectedRowsFromSlickGrid
          .map((idx: number) => dataView.getItem(idx))
          .filter((item: any) => item);
      }
  
  
      if (selectedItems.length === 0) {
        this.notification.warning(
          NOTIFICATION_TITLE.warning,
          'Vui lòng chọn ít nhất 1 bản ghi để xóa!'
        );
        return;
      }
  
      const selectedIds: number[] = [];
      const selectedCodes: string[] = [];
  
      selectedItems.forEach((item: any) => {
        if (item && item.Id) {
          selectedIds.push(item.Id);
          selectedCodes.push(item.Code || '');
        }
      });
  
      if (selectedIds.length === 0) {
        this.notification.warning(
          NOTIFICATION_TITLE.warning,
          'Không tìm thấy yêu cầu hợp lệ để xóa!'
        );
        return;
      }
  
      const confirmMessage =
        selectedIds.length === 1
          ? `Bạn có chắc chắn muốn xóa khách hàng mã ${selectedCodes[0]}?`
          : `Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`;
  
      this.modal.confirm({
        nzTitle: 'Xác nhận xóa',
        nzContent: confirmMessage,
        nzOkText: 'Đồng ý',
        nzCancelText: 'Hủy',
        nzOkDanger: true,
        nzOnOk: () => {
          this.customerService.deleteCustomer(selectedIds).subscribe({
            next: (res) => {
              if (res.status === 1) {
                this.notification.success(
                  NOTIFICATION_TITLE.success,
                  res.message || 'Đã xóa thành công!'
                );
                this.getCustomer();
              } else {
                this.notification.warning(
                  NOTIFICATION_TITLE.warning,
                  res.message || 'Không thể xóa các bản ghi này!'
                );
              }
            },
            error: (err) => {
              this.notification.error(
                NOTIFICATION_TITLE.error,
                err?.error?.message || err?.message || 'Có lỗi xảy ra khi xóa!'
              );
            },
          });
        },
      });
    }
}
