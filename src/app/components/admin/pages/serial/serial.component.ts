import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
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
import { TemplateRef } from '@angular/core';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../../../../app/app.config';
import { ReactiveFormsModule } from '@angular/forms';
import { SerialService } from '../../../../services/serial-service/serial.service';

@Component({
  selector: 'app-serial',
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
  templateUrl: './serial.component.html',
  styleUrl: './serial.component.less',
})
export class SerialComponent implements OnInit, AfterViewInit {
  @ViewChild('unitFormTpl', { static: true }) unitFormTpl!: TemplateRef<any>;

  columnSerial: Column[] = [];
  gridOptionsSerial: GridOption = {};

  columnIssues: Column[] = [];
  gridOptionsIssues: GridOption = {};

  datasetSerial: any[] = [];
  isCheckmode: boolean = false;
  SerialID: number = 0;
  SerialData: any = null;

  angularGrid: any;
  dataView: any;

  formGroup: FormGroup;
  private unitModalRef: NzModalRef | null = null;

  dataProducts: any[] = [];

  ngOnInit(): void {
    this.defineGrid();
    this.getSerial();
    this.getdataProducts();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private serialService: SerialService,
    private modal: NzModalService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      ProductId: [null, [Validators.required, Validators.maxLength(50)]],
      ProductSerial: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  defineGrid() {
    this.columnSerial = [
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
        id: 'ProductSerial',
        name: 'Mã serial',
        field: 'ProductSerial',
        width: 200,
        minWidth: 150,
        maxWidth: 250,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Tên sản phẩm',
        field: 'Name',
        minWidth: 200,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptionsSerial = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-serial-container',
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
      this.SerialID = 0;
      this.SerialData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.SerialID = dataContext?.Id ?? 0;
    this.SerialData = dataContext || null;
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.SerialID = 0;
      this.SerialData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.SerialID = item?.Id ?? 0;
    this.SerialData = item || null;
  }

  filterOption = (input: string, option: any): boolean => {
    if (!input) return true;
    const searchText = input.toLowerCase();
    const label = option.nzLabel?.toLowerCase() || '';
    return label.includes(searchText);
  };

  getSerial() {
    this.serialService.getSerial(0).subscribe((response: any) => {
      this.datasetSerial = response?.data || [];
    });
  }
  getdataProducts() {
    this.serialService.getDataProducts().subscribe((response: any) => {
      this.dataProducts = response.data || [];
    });
  }

  onAddSerial(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.SerialID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }

    if (this.isCheckmode) {
      this.formGroup.reset({
        ProductId: this.SerialData?.ProductId || null,
        ProductSerial: this.SerialData?.ProductSerial || '',
      });
    } else {
      this.formGroup.reset({ ProductId: null, ProductSerial: '' });
    }

    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode ? 'Sửa Serial' : 'Thêm Serial',
      nzContent: this.unitFormTpl,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
    });

    this.unitModalRef = modalRef;

    modalRef.afterClose.subscribe((result) => {
      this.unitModalRef = null;
      if (result === true) {
        // Reload cả master và detail
        this.getSerial();
      }
    });
  }

  onCancelUnit(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.unitModalRef?.destroy(false);
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

    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const formValue = this.formGroup.value;
    if (this.isCheckmode) {
    }
    const payload = {
      Id: this.isCheckmode ? this.SerialData?.Id || 0 : 0,
      ProductId: formValue.ProductId,
      ProductSerial: formValue.ProductSerial,
    };

    this.serialService.saveDataSerial(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isCheckmode
            ? 'Cập nhật thành công!'
            : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.unitModalRef?.destroy(true);
          this.getSerial();
        } else {
          this.notification.warning(
            'Thông báo',
            res.message || 'Không thể lưu dữ liệu!'
          );
        }
      },
      error: (err) => {
        this.notification.error('Thông báo', 'Lỗi khi lưu dữ liệu!');
      },
    });
  }

  onDeleteMultiple() {
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
        'Vui lòng chọn ít nhất 1 đơn vị để xóa!'
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
        'Không tìm thấy serial hợp lệ để xóa!'
      );
      return;
    }

    const confirmMessage =
      selectedIds.length === 1
        ? `Bạn có chắc chắn muốn xóa serial ${selectedCodes[0]}?`
        : `Bạn có chắc chắn muốn xóa ${selectedIds.length} serial đã chọn?`;

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: confirmMessage,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.serialService.deleteSerial(selectedIds).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success(
                NOTIFICATION_TITLE.success,
                res.message || 'Đã xóa thành công!'
              );
              this.getSerial();
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
