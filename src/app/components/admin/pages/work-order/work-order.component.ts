import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
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
  SliderRangeOption,
  OperatorType,
  Subscription,
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
import { WorkOrderService } from '../../../../services/work-order-service/work-order.service';
import { WorkOrderFormComponent } from './work-order-form/work-order-form.component';

@Component({
  selector: 'app-work-order',
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
  ],

  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.less',
})
export class WorkOrderComponent implements OnInit, AfterViewInit {
  columnWorkOrder: Column[] = [];
  gridOptionsWorkOrder: GridOption = {};
  datasetWorkOrder: any[] = [];

  isCheckmode: boolean = false;
  WorkOrderId: number = 0;
  WorkOrderData: any;

  angularGrid: any;
  dataView: any;

  ngOnInit(): void {
    this.defineGrid();
    this.getWorkOrder();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private workOrderService: WorkOrderService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  defineGrid() {
    this.columnWorkOrder = [
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
        name: 'Mã WO',
        field: 'Code',
        width: 100,
        minWidth: 150,
        maxWidth: 200,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ClaimNo',
        name: 'Mã yêu cầu',
        field: 'ClaimNo',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'DateStart',
        name: 'Ngày tạo',
        field: 'DateStart',
        sortable: true,
        minWidth: 120,
        type: 'dateUtc',
        formatter: (_row, _cell, value) => {
          if (!value) return '';
          const d = new Date(value);
          return d.toLocaleDateString('vi-VN');
        },
        filterable: true,
        filter: { model: Filters['compoundDate'] },
      },
      {
        id: 'CustomerName',
        name: 'Khách hàng',
        field: 'CustomerName',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Sản phẩm',
        field: 'Name',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'FullName',
        name: 'Kỹ thuật viên',
        field: 'FullName',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ProgressComplete',
        name: 'Tiến độ',
        field: 'ProgressComplete',
        width: 200,
        minWidth: 130,
        maxWidth: 220,
        sortable: true,
        formatter: (row, cell, value, columnDef, dataContext, grid) => {
          if (value === null || value === undefined || value === '') return '';

          let pct = Number(value);
          if (Number.isNaN(pct)) return '';
          if (pct > 0 && pct <= 1) pct = pct * 100;
          pct = Math.max(0, Math.min(100, Math.round(pct)));

          return Formatters.progressBar(
            row,
            cell,
            pct,
            columnDef,
            dataContext,
            grid
          );
        },
        type: 'number',
        filterable: true,
        filter: {
          model: Filters['sliderRange'],
          maxValue: 100,
          operator: OperatorType.rangeInclusive,
          filterOptions: {
            hideSliderNumbers: false,
            min: 0,
            step: 5,
          } as SliderRangeOption,
        },
      },
      {
        id: 'Status',
        name: 'Trạng thái',
        field: 'Status',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
        formatter: (_row, _cell, value) => {
          if (!value) return '';

          let bgColor = '#d9d9d9';
          let textColor = '#000';

          switch (value.trim()) {
            case 'Đang sửa chữa':
              bgColor = '#cce5ff';
              textColor = '#004085';
              break;
            case 'Chờ xử lý':
              bgColor = '#fff3cd';
              textColor = '#856404';
              break;
            case 'Chờ vật tư':
              bgColor = '#f8d7da';
              textColor = '#721c24';
              break;
            case 'Hoàn thành':
              bgColor = '#d4edda';
              textColor = '#155724';
              break;
            case 'Đã nghiệm thu':
              bgColor = '#13c2c2';
              textColor = '#fff';
              break;
          }

          return `
            <span style="
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              background: ${bgColor};
              color: ${textColor};
              font-weight: 500;
              font-size: 12px;
            ">${value}</span>
          `;
        },
      },
    ];

    this.gridOptionsWorkOrder = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-workorder-container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      rowHeight: 45,
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
    this.angularGrid = e?.detail || e;
    this.dataView = this.angularGrid?.dataView;
  }

  getWorkOrder() {
    this.workOrderService.getWorkOrder(0).subscribe((response: any) => {
      this.datasetWorkOrder = response?.data || [];
    });
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.WorkOrderId = 0;
      this.WorkOrderData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.WorkOrderId = dataContext?.Id ?? 0;
    this.WorkOrderData = dataContext || null;
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.WorkOrderId = 0;
      this.WorkOrderData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.WorkOrderId = item?.Id ?? 0;
    this.WorkOrderData = item || null;
  }

  onAddWorkOrder(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.WorkOrderId === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode
        ? `Sửa yêu cầu - ${this.WorkOrderData?.Code || ''}`
        : 'Thêm yêu cầu',
      nzContent: WorkOrderFormComponent,
      nzWidth: '50vw',
      nzBodyStyle: {
        'max-height': '70vh',
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
      },
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        WorkOrderID: this.WorkOrderId,
        isEditMode: this.isCheckmode,
        dataInput: this.WorkOrderData,
      },
    });

    if (!this.isCheckmode) {
      this.setupModalTitleUpdater(modalRef);
    }

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.getWorkOrder();
      }
    });
  }

  private setupModalTitleUpdater(modalRef: any): void {
    let titleSub: Subscription | undefined;
    modalRef.afterOpen.subscribe(() => {
      const contentComponent =
        modalRef.getContentComponent() as WorkOrderFormComponent;
      const codeCtrl = contentComponent?.formGroup?.get('Code');
      if (!codeCtrl) return;

      const updateTitle = (code: string) => {
        if (!code) return;
        const newTitle = `Thêm yêu cầu - ${code}`;
        modalRef.updateConfig({ nzTitle: newTitle });
        // Fallback: direct DOM update
        setTimeout(() => {
          const modalTitleEl = document.querySelector('.ant-modal-title');
          if (modalTitleEl) {
            modalTitleEl.textContent = newTitle;
          }
        }, 0);
      };

      if (codeCtrl.value) {
        updateTitle(codeCtrl.value);
      }

      titleSub = codeCtrl.valueChanges.subscribe((code) => {
        updateTitle(code);
      });
    });

    modalRef.afterClose.subscribe(() => {
      titleSub?.unsubscribe();
    });
  }

  onDeleteMultipleWorkOrders() {
    if (!this.angularGrid) {
      this.notification.error(
        NOTIFICATION_TITLE.error,
        'Grid chưa được khởi tạo!'
      );
      return;
    }

    const gridService = this.angularGrid.gridService;
    const dataView = this.angularGrid.dataView;

    let selectedItems: any[] = [];

    if (gridService && gridService.getSelectedRows) {
      const selectedRows = gridService.getSelectedRows();
      selectedItems = selectedRows
        .map((idx: number) => dataView.getItem(idx))
        .filter((item: any) => item);
    } else if (dataView && dataView.getSelectedIds) {
      const selectedIds = dataView.getSelectedIds();
      selectedItems = selectedIds
        .map((id: any) => dataView.getItemById(id))
        .filter((item: any) => item);
    }

    if (selectedItems.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn ít nhất 1 yêu cầu để xóa!'
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
        ? `Bạn có chắc chắn muốn xóa yêu cầu ${selectedCodes[0]}?`
        : `Bạn có chắc chắn muốn xóa ${selectedIds.length} yêu cầu đã chọn?`;

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: confirmMessage,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.workOrderService.deleteWorkOrders(selectedIds).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success(
                NOTIFICATION_TITLE.success,
                res.message || 'Đã xóa thành công!'
              );
              this.getWorkOrder();
              this.WorkOrderId = 0;
              this.WorkOrderData = null;
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
