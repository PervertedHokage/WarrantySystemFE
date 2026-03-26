import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  AngularSlickgridModule,
  Column,
  Filters,
  Formatters,
  GridOption,
  OperatorType,
  SliderRangeOption,
} from 'angular-slickgrid';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WorkOrderService } from '../../../../../../services/work-order-service/work-order.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NOTIFICATION_TITLE } from '../../../../../../app.config';
import { WorkOrderFormComponent } from '../../../work-order/work-order-form/work-order-form.component';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Subscription } from 'rxjs';
import { WarrantyClaimDTO } from '../../../../../../models/warranty-claims/warranty-claim-dto.model';

@Component({
  selector: 'warranty-work-order-no-save',
  templateUrl: './warranty-work-order-no-save.component.html',
  styleUrls: ['./warranty-work-order-no-save.component.less'],
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
})
export class WarrantyWorkOrderNoSaveComponent implements OnInit, AfterViewInit {
  @Input() claimNo: string = '';
  @Input() warrantyClaim?: WarrantyClaimDTO;
  columnWorkOrder: Column[] = [];
  gridOptionsWorkOrder: GridOption = {};
  datasetWorkOrder: any[] = [];

  // Local state management
  sparePartsMap: Map<number, any[]> = new Map();
  deletedWorkOrderIds: number[] = [];
  tempIdCounter: number = -1;

  countChoXuLy: number = 0;
  countDangSuaChua: number = 0;
  countChoVatTu: number = 0;
  countHoanThanh: number = 0;

  woChoXuLy: any[] = [];
  woDangSuaChua: any[] = [];
  woChoVatTu: any[] = [];
  woHoanThanh: any[] = [];

  isCheckmode: boolean = false;
  WorkOrderId: number = 0;
  WorkOrderData: any;

  angularGrid: any;
  dataView: any;

  constructor(
    private notification: NzNotificationService,
    private workOrderService: WorkOrderService,
    private modal: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.defineGrid();
    this.getWorkOrder();
  }

  ngAfterViewInit(): void {}

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
            grid,
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
        cssClass: 'cell-center',
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
          return `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${bgColor}; color: ${textColor}; font-weight: 500; font-size: 12px;">${value}</span>`;
        },
      },
      {
        id: 'actions',
        name: 'Thao tác',
        field: 'actions',
        minWidth: 90,
        maxWidth: 110,
        sortable: false,
        filterable: false,
        formatter: () =>
          `<button class="btn btn-sm" style="background-color: #f39c12; color: #fff;">Xem</button>`,
        onCellClick: (_e, args) => {
          const item = args?.dataContext;
          this.openWorkOrder(item);
        },
      },
    ];

    this.gridOptionsWorkOrder = {
      enableAutoResize: true,
      autoResize: {
        container: '#warranty_work_order_no_save_grid_container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      rowHeight: 67,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      checkboxSelector: { hideSelectAllCheckbox: false },
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
    if (!this.claimNo) {
      this.datasetWorkOrder = [];
      this.computeOverviewCounts();
      return;
    }
    this.workOrderService
      .getWorkOrderByClaimNo(this.claimNo)
      .subscribe((response: any) => {
        this.datasetWorkOrder = response?.data || [];
        // Initially, we might want to also fetch spare parts for each?
        // But the component usually only fetches them when editing a specific WO.
        // For no-save, we'll fetch them on demand or we'll have to manage it.
        this.computeOverviewCounts();
      });
  }

  private computeOverviewCounts(): void {
    const items = Array.isArray(this.datasetWorkOrder)
      ? this.datasetWorkOrder
      : [];
    const countByStatus = (status: string) =>
      items.filter((x: any) => (x?.Status || '').toString().trim() === status)
        .length;

    this.countChoXuLy = countByStatus('Chờ xử lý');
    this.countDangSuaChua = countByStatus('Đang sửa chữa');
    this.countChoVatTu = countByStatus('Chờ vật tư');
    this.countHoanThanh = countByStatus('Hoàn thành');

    this.cdr.detectChanges();
  }

  openWorkOrder(item: any): void {
    this.WorkOrderData = item;
    this.WorkOrderId = item.Id;
    this.onAddWorkOrder(true);
  }

  openStatusList(status: string) {
    if (this.dataView) {
      this.dataView.setFilterArgs({ status });
      this.dataView.setFilter((item: any) => {
        return (item.Status || '').toString().trim() === status;
      });
    }
  }

  onAddWorkOrder(isEditmode: boolean): void {
    const modalRef = this.modal.create({
      nzTitle: isEditmode
        ? `Sửa yêu cầu - ${this.WorkOrderData?.Code || ''}`
        : 'Thêm yêu cầu',
      nzContent: WorkOrderFormComponent,
      nzWidth: '50vw',
      nzFooter: null,
      nzMaskClosable: false,
      nzData: {
        WorkOrderID: this.WorkOrderId,
        isEditMode: isEditmode,
        dataInput: isEditmode
          ? this.WorkOrderData
          : {
              WarrantyClaimId: this.warrantyClaim?.Id,
              ClaimNo: this.warrantyClaim?.ClaimNo,
              CustomerName: this.warrantyClaim?.CustomerName,
              ProductId: this.warrantyClaim?.ProductId,
              Status: 'Chờ xử lý',
              DateStart: new Date().toISOString(),
            },
        claimNo: this.claimNo,
        isNoSave: true, // Enable no-save mode
      },
    });

    modalRef.afterClose.subscribe((result) => {
      if (result && typeof result === 'object') {
        const payload = result;
        const workOrder = payload.WorkOrder;
        const spareParts = payload.WorkOrderSpareParts;

        if (isEditmode) {
          const index = this.datasetWorkOrder.findIndex(
            (x) => x.Id === this.WorkOrderId,
          );
          if (index !== -1) {
            // Merge form results back into the grid item
            this.datasetWorkOrder[index] = {
              ...this.datasetWorkOrder[index],
              ...workOrder,
              // We might need to manually update some fields like Status text if they changed
            };
            this.sparePartsMap.set(this.WorkOrderId, spareParts);
          }
        } else {
          const newId = this.tempIdCounter--;
          workOrder.Id = newId;
          this.datasetWorkOrder = [workOrder, ...this.datasetWorkOrder];
          this.sparePartsMap.set(newId, spareParts);
        }

        this.datasetWorkOrder = [...this.datasetWorkOrder];
        this.computeOverviewCounts();
        if (this.angularGrid) this.angularGrid.gridService.renderGrid();
      }
    });
  }

  onDeleteMultipleWorkOrders() {
    const gridService = this.angularGrid.gridService;
    const selectedRows = gridService.getSelectedRows();
    const selectedItems = selectedRows
      .map((idx: number) => this.dataView.getItem(idx))
      .filter((item: any) => item);

    if (selectedItems.length === 0) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn ít nhất 1 yêu cầu để xóa!',
      );
      return;
    }

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa ${selectedItems.length} yêu cầu đã chọn?`,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        selectedItems.forEach((item: any) => {
          if (item.Id > 0) {
            this.deletedWorkOrderIds.push(item.Id);
          }
          this.datasetWorkOrder = this.datasetWorkOrder.filter(
            (x) => x.Id !== item.Id,
          );
          this.sparePartsMap.delete(item.Id);
        });
        this.datasetWorkOrder = [...this.datasetWorkOrder];
        this.computeOverviewCounts();
        if (this.angularGrid) this.angularGrid.gridService.renderGrid();
      },
    });
  }
}
