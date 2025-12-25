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

  isCheckmode: boolean = false;

  ngOnInit(): void {
    this.defineGrid();
    this.getSaleOrder();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private salesOrderService: SalesOrderService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

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
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CustomerName',
        name: 'Tên khách hàng',
        field: 'CustomerName',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Model',
        field: 'Name',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ProductSerial',
        name: 'Serial/IMEI',
        field: 'ProductSerial',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'DateStart',
        name: 'Ngày kích hoạt',
        field: 'DateStart',
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
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
      datasetIdPropertyName: 'Id',
      enableCellNavigation: true,
    };
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

    console.log('ProductDAta', this.SaleOrderData);
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

  getSaleOrder() {
    this.salesOrderService.getSaleOrder(0).subscribe((response: any) => {
      this.datasetSaleOrderGroup = response?.data || [];
    });
    console.log('SaleOrderData', this.datasetSaleOrderGroup);
  }

  onDeleteSaleOrder() {
    if (!this.SaleOrderID) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn 1 đơn hàng để xóa!'
      );
      return;
    }

    const order = this.SaleOrderData || {};
    const payload = {
      Order: {
        ...order,
        IsDeleted: true,
      },
      OrderDetails: [],
      OrderDetailInfo: [],
      DeletedOrder: [],
    };

    const productName = this.SaleOrderData?.Name || 'lỗi này';
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa đơn hàng ${productName}?`,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.salesOrderService.saveDataSaleOder(payload).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success('Thông báo', 'Đã xóa thành công!');
              this.getSaleOrder();
            } else {
              this.notification.warning(
                'Thông báo',
                res.message || 'Không thể xóa bản ghi này!'
              );
            }
          },
          error: () => {
            this.notification.error('Thông báo', 'Có lỗi xảy ra khi xóa!');
          },
        });
      },
    });
  }

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
      nzWidth: '50vw',
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
        this.getSaleOrder();
      }
    });
  }
}
