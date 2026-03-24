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
  MultipleSelectOption,
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
import { SalesOrderService } from '../../../../services/sales-order-service/sales-order.service';
import { SalesOrderFormComponent } from './sales-order-form/sales-order-form.component';
import { ImportExcelProductSaleComponent } from './sales-order-excel/sales-order-excel.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-sales-order',
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
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.less',
})
export class SalesOrderComponent implements OnInit, AfterViewInit {
  columnSaleOrderGroup: Column[] = [];
  gridOptionSaleOrderGroup: GridOption = {};
  datasetSaleOrderGroup: any[] = [];

  SaleOrderID: number = 0;
  SaleOrderData: any;

  angularGrid: any;
  dataView: any;

  isCheckmode: boolean = false;
  dateFormat = 'dd/MM/yyyy';

  showFilter = false;
  filter = {
    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    toDate: new Date(),
  };

  ngOnInit(): void {
    this.defineGrid();
    // this.getSaleOrder();
  }

  ngAfterViewInit(): void { }

  constructor(
    private notification: NzNotificationService,
    private salesOrderService: SalesOrderService,
    private modal: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) { }

  private parseToDate(value: any): Date | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  private calcDaysRemaining(dateEnd: any): number | null {
    const end = this.parseToDate(dateEnd);
    if (!end) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  private getWarrantyStatusLabel(dateEnd: any): {
    text: string;
    color: string;
    daysRemaining: number | null;
  } {
    const daysRemaining = this.calcDaysRemaining(dateEnd);
    const expiringThresholdDays = 30;

    if (daysRemaining === null) {
      return { text: '', color: '#8c8c8c', daysRemaining };
    }

    if (daysRemaining < 0) {
      return { text: 'Hết hạn', color: '#ff4d4f', daysRemaining };
    }

    if (daysRemaining <= expiringThresholdDays) {
      return { text: 'Sắp hết hạn', color: '#fa8c16', daysRemaining };
    }

    return { text: 'Còn hạn', color: '#52c41a', daysRemaining };
  }

  applyFilter() {
    this.getSynthesisOfGeneratedMaterials();
  }
  resetFilter() {
    this.filter = {
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days prior
      toDate: new Date(),
    };
  }

  defineGrid() {
    this.columnSaleOrderGroup = [
      {
        id: 'stt',
        name: 'STT',
        field: 'stt',
        minWidth: 30,
        maxWidth: 50,
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
        name: 'So Code',
        field: 'Code',
        sortable: true,
        minWidth: 100,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerName',
        name: 'Tên khách hàng',
        field: 'CustomerName',
        sortable: true,
        minWidth: 200,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Model',
        field: 'Name',
        minWidth: 150,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: {
          model: Filters['multipleSelect'],
          collection: [],
          collectionOptions: { addBlankEntry: true },
          filterOptions: {
            filter: true,
            autoAdjustDropWidthByTextSize: true,
          } as MultipleSelectOption,
        },
      },
      {
        id: 'ProductSerial',
        name: 'Serial',
        field: 'ProductSerial',
        sortable: true,
        minWidth: 150,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'IMEI1',
        name: 'IMEI 1',
        field: 'Imei1',
        sortable: true,
        minWidth: 150,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'IMEI2',
        name: 'IMEI 2',
        field: 'Imei2',
        sortable: true,
        minWidth: 150,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'DateStart',
        name: 'Ngày kích hoạt',
        field: 'DateStart',
        minWidth: 120,
        sortable: true,
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
        id: 'DateEnd',
        name: 'Hạn bảo hành',
        field: 'DateEnd',
        minWidth: 120,
        sortable: true,
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
        id: 'WarrantyStatus',
        name: 'Trạng thái BH',
        field: 'DateEnd',
        minWidth: 150,
        sortable: false,
        filterable: false,
        formatter: (_row, _cell, value) => {
          const st = this.getWarrantyStatusLabel(value);
          if (!st.text) return '';
          const daysText =
            st.text === 'Sắp hết hạn' && st.daysRemaining !== null
              ? ` (${st.daysRemaining} ngày)`
              : '';
          return `<span style="color:${st.color}; font-weight:600;">${st.text}${daysText}</span>`;
        },
      },
    ];

    this.gridOptionSaleOrderGroup = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-sale-container',
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
    // this.getSaleOrder();
    this.getSynthesisOfGeneratedMaterials();
  }
  gridReady(e: any) {
    this.angularGrid = e.detail || e;
    this.dataView = this.angularGrid?.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.SaleOrderID = 0;
      this.SaleOrderData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.SaleOrderID = dataContext?.OrderId ?? 0;
    this.SaleOrderData = dataContext || null;
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.SaleOrderID = 0;
      this.SaleOrderData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.SaleOrderID = item?.OrderId ?? 0;
    this.SaleOrderData = item || null;
  }

  // getSaleOrder() {
  //   this.salesOrderService.getSaleOrder(0).subscribe((response: any) => {
  //     this.datasetSaleOrderGroup = response?.data || [];
  //   });
  // }

  onAddSaleOrder(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.SaleOrderID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }
    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode ? 'Sửa đơn hàng' : 'Thêm đơn hàng',
      nzContent: SalesOrderFormComponent,
      nzWidth: '85vw',
      nzBodyStyle: {
        'max-height': '70vh',
        overflow: 'auto',
      },
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        SaleOrderID: this.SaleOrderID,
        isEditMode: this.isCheckmode,
        dataInput: this.SaleOrderData,
      },
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.getSynthesisOfGeneratedMaterials();
      }
    });
  }

  onImportExcel(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Nhập dữ liệu Excel',
      nzContent: ImportExcelProductSaleComponent,
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '70vh',
        overflow: 'auto',
      },
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.getSynthesisOfGeneratedMaterials();
      }
    });
  }
  onExportExcel() {
    this.salesOrderService
      .exportExcel(0, this.filter.fromDate, this.filter.toDate)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SaleOrders.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
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
        selectedCodes.push(item.CustomerName || '');
      }
    });

    if (selectedIds.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Không tìm thấy đơn hàng hợp lệ để xóa!'
      );
      return;
    }

    const confirmMessage =
      selectedIds.length === 1
        ? `Bạn có chắc chắn muốn xóa đơn hàng của khách hàng ${selectedCodes[1]}?`
        : `Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn?`;

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: confirmMessage,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.salesOrderService.deleteSaleOrder(selectedIds).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success(
                NOTIFICATION_TITLE.success,
                res.message || 'Đã xóa thành công!'
              );
              this.getSynthesisOfGeneratedMaterials();
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

  applyDistinctFilters(): void {
    const angularGrid = this.angularGrid;
    if (!angularGrid || !angularGrid.slickGrid || !angularGrid.dataView) return;

    const data = angularGrid.dataView.getItems() as any[];
    if (!data || data.length === 0) return;

    const getUniqueValues = (
      items: any[],
      field: string
    ): Array<{ value: any; label: string }> => {
      const map = new Map<string, { value: any; label: string }>();
      items.forEach((row: any) => {
        const value = row?.[field];
        if (value === null || value === undefined || value === '') return;
        const key = `${typeof value}:${String(value)}`;
        if (!map.has(key)) {
          map.set(key, { value, label: String(value) });
        }
      });
      return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    };

    const columns = angularGrid.slickGrid.getColumns();
    if (columns) {
      columns.forEach((column: any) => {
        if (
          column.filter &&
          column.filter.model === Filters['multipleSelect']
        ) {
          const field = column.field;
          if (!field) return;
          column.filter.collection = getUniqueValues(data, field);
        }
      });
    }

    if (this.columnSaleOrderGroup) {
      this.columnSaleOrderGroup.forEach((colDef: any) => {
        if (
          colDef.filter &&
          colDef.filter.model === Filters['multipleSelect']
        ) {
          const field = colDef.field;
          if (!field) return;
          colDef.filter.collection = getUniqueValues(data, field);
        }
      });
    }

    const updatedColumns = angularGrid.slickGrid.getColumns();
    angularGrid.slickGrid.setColumns(updatedColumns);
    angularGrid.slickGrid.invalidate();
    angularGrid.slickGrid.render();
  }

  async getSynthesisOfGeneratedMaterials() {
    //  const request = { SaleOrderId: 0, FromDateStart: new Date('2020-12-12'), ToDateStart: new Date('2025-12-12')};

    this.salesOrderService
      .getSaleOrder(0, this.filter.fromDate, this.filter.toDate)
      .subscribe({
        next: (response: any) => {
          let dataArray: any[] = [];

          if (Array.isArray(response.data)) {
            dataArray = response.data;
          } else if (response.data && Array.isArray(response.data.dt)) {
            dataArray = response.data.dt;
          } else if (response.data && typeof response.data === 'object') {
            dataArray = [];
          }

          this.datasetSaleOrderGroup = dataArray.map(
            (item: any, index: number) => ({
              ...item,
              id: item.ID || item.Id || index + 1,
            })
          );
          this.cdr.detectChanges();

          setTimeout(() => {
            this.applyDistinctFilters();
          }, 100);
        },
        error: (error) => {
          this.notification.error(
            'Lỗi',
            error.error?.message || 'Có lỗi xảy ra'
          );
          console.error('Lỗi:', error);
        },
      });
  }
}
