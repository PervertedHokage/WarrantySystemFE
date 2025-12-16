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
import { ProductService } from './products-service/product.service';
import { ProductsFormComponent } from './products-form/products-form.component';
import { NOTIFICATION_TITLE } from '../../../../../app/app.config';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
  styleUrl: './products.component.less',
})
export class ProductsComponent implements OnInit, AfterViewInit {
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  isCheckmode: boolean = false;
  ProductID: number = 0;

  slickGrid: any;

  // slickgrid refs
  angularGrid: any;
  dataView: any;

  ProductData: any;

  ngOnInit(): void {
    this.defineGrid();
    this.getProducts();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private productService: ProductService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  defineGrid() {
    this.columnDefinitions = [
      {
        id: 'Id',
        name: 'ID',
        field: 'Id',
        width: 50,
        sortable: true,
        type: 'number',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Code',
        name: 'Mã sản phẩm',
        field: 'Code',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Tên sản phẩm',
        field: 'Name',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Description',
        name: 'Mô tả',
        field: 'Description',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-container',
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

  getProducts() {
    this.productService.getDataProducts().subscribe((res: any) => {
      this.dataset = res?.data || [];
    });
  }

  onAddProduct(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.ProductID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }
    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode ? 'Sửa sản phẩm' : 'Thêm sản phẩm',
      nzContent: ProductsFormComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        ProductID: this.ProductID,
        isEditMode: this.isCheckmode,
        dataInput: this.ProductData,
      },
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.getProducts();
      }
    });
  }
  onDeleteProduct() {
    if (!this.ProductID) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn 1 sản phẩm để xóa!'
      );
      return;
    }

    const product = this.ProductData || {};
    const payload = {
      ...product,
      Id: product?.Id ?? this.ProductID,
      IsDeleted: true,
    };

    const productName = this.ProductData?.Name || 'sản phẩm này';
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa sản phẩm ${productName}?`,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.productService.saveDataProduct(payload).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success('Thông báo', 'Đã xóa thành công!');
              this.getProducts();
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

  gridReady(e: any) {
    this.angularGrid = e.detail.angularGrid;
    this.dataView = e.detail.angularGrid.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.ProductID = 0;
      this.ProductData = null;
      return;
    }

    const dataContext =
      this.angularGrid?.gridService?.getDataItemByRowIndex(row) ||
      this.dataView?.getItem(row) ||
      this.angularGrid?.dataView?.getItem(row) ||
      args?.grid?.getDataItem?.(row);

    this.ProductID = dataContext?.Id ?? 0;
    this.ProductData = dataContext || null;
    console.log('ProductID', this.ProductID);
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.ProductID = 0;
      this.ProductData = null;
      return;
    }

    const rowIndex = rows[0];
    const item =
      this.angularGrid?.gridService?.getDataItemByRowIndex(rowIndex) ||
      this.dataView?.getItem(rowIndex) ||
      this.angularGrid?.dataView?.getItem(rowIndex) ||
      args?.grid?.getDataItem?.(rowIndex);

    this.ProductID = item?.Id ?? 0;
    this.ProductData = item || null;
  }
}
