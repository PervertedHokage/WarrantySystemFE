import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import {
  EnvironmentInjector,
  ApplicationRef,
  Type,
  createComponent,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ChangeDetectorRef } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { SelectControlComponent } from '../../select-control/select-control.component' 
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';
import { NOTIFICATION_TITLE } from '../../../../../../app/app.config';
import { SalesOrderService } from '../../../../../services/sales-order-service/sales-order.service';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzSplitterModule,
    NzCheckboxModule,
    NzSelectModule,
  ],
  templateUrl: './sales-order-form.component.html',
  styleUrl: './sales-order-form.component.less',
})
export class SalesOrderFormComponent implements OnInit, AfterViewInit {
  @ViewChild('OrderTable') tableRef1!: ElementRef;

  SaleOrderID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  formGroup: FormGroup;

  OrderData: any;
  OrderTable: Tabulator | null = null;

  productOptions: any;

  DeletedOrder: any[] = [];

  private parseDateInput(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    const s = String(value).trim();
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  private validateRowDates(rowData: any): boolean {
    const start = this.parseDateInput(rowData?.DateStart);
    const end = this.parseDateInput(rowData?.DateEnd);
    if (!start || !end) return true;
    return start.getTime() < end.getTime();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.dataInput) {
      this.formGroup.patchValue({
        CustomerName: this.dataInput.CustomerName || '',
        CustomerPhoneNumber: this.dataInput.CustomerPhoneNumber || '',
        CustomerAddress: this.dataInput.CustomerAddress || '',
        CustomerEmail: this.dataInput.CustomerEmail || '',
      });
    }
    this.loadOptionProduct();
  }

  ngAfterViewInit(): void {
      setTimeout(() => {
      this.draw_OrderTable();
      
      if (this.isEditMode && this.SaleOrderID) {
        this.loadOrderData();
      }
    }, 100);
  }

  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { SaleOrderID: number; isEditMode: boolean; dataInput: any },
    private fb: FormBuilder,
    private modal: NzModalService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private salesOrderService: SalesOrderService,
    private cdr: ChangeDetectorRef,
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef,
  ) {
    if (data) {
      this.SaleOrderID = data.SaleOrderID || 0;
      this.isEditMode = data.isEditMode || false;
      this.dataInput = data.dataInput || null;
    }
    this.formGroup = this.fb.group({
      CustomerName: [null, [Validators.required, Validators.maxLength(50)]],
      CustomerPhoneNumber: [
        '',
        [Validators.required, Validators.maxLength(20)],
      ],
      CustomerAddress: ['', [Validators.required, Validators.maxLength(100)]],
      CustomerEmail: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }
  close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

  loadOrderData() {
    if (!this.SaleOrderID) {
      return;
    }
    console.log('Load Order Data for SaleOrderID:', this.SaleOrderID);
    this.salesOrderService.getSaleOrder(this.SaleOrderID).subscribe({
      next: (response) => {
        const order = response?.data || [];
        this.OrderData = order.map((item: any) => ({
          Id: item.Id || 0,
          OrderId: item.OrderId || 0,
          OrderDetailId: item.OrderDetailId || 0,
          OrderDetailInfoId: item.OrderDetailInfoId || 0,
          ProductId: item.ProductId || 0,
          SerialId: item.SerialId || 0,
          Code: item.Code || '',
          Name: item.Name || '',
          ProductSerial: item.ProductSerial || '',
          Quantity: item.Quantity || 0,
          DateStart: item.DateStart || '',
          DateEnd: item.DateEnd || '',
        }));

        if (this.OrderTable) {
          this.OrderTable.setData(this.OrderData);
          console.log('OrderData', this.OrderData);
        }
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Lỗi khi load dữ liệu chi tiết order!'
        );
        console.error(err);
      },
    });
  }

  loadOptionProduct() {
    this.salesOrderService.getProduct(0).subscribe({
      next: (res: any) => {
        const productData = res.data;
            console.log('employeeData', productData);
        if (Array.isArray(productData)) {
          this.productOptions = productData
            .filter(
              (product) =>
                product.ProductId !== null &&
                product.ProductId !== undefined &&
                product.ProductId !== 0
            )
            .map((product) => ({
              label: product.Code + '-' + product.Name,
              value: product.ProductId,
              Code: product.Code,
              Name: product.Name,
              ProductSerial: product.ProductSerial,
              SerialId: product.SerialId
            }));
            console.log('employeeOptions', this.productOptions);
        } else {
          this.productOptions = [];
        }
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error(
          'Thông báo',
          'Có lỗi xảy ra khi lấy danh sách order'
        );
        this.productOptions = [];
      },
    });
  }
  
    dateEditor(cell: CellComponent, onRendered: any, success: any, cancel: any) {
    const input = document.createElement('input');
    input.type = 'date'; // hiển thị lịch dropdown
    input.value = cell.getValue() || '';

    onRendered(() => input.focus());

    input.addEventListener('change', () => success(input.value));
    input.addEventListener('blur', () => success(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') success(input.value);
      if (e.key === 'Escape') cancel();
    });

    return input;
  }

   private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

   // Lưu cả master và detail
  saveSaleOrderData() {
    this.trimAllStringControls();
    
    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const tableData = this.OrderTable?.getData() || [];
    
    if (tableData.length === 0) {
      this.notification.warning('Thông báo', 'Vui lòng thêm ít nhất 1 thiết bị!');
      return;
    }

    const formValue = this.formGroup.value;
    if(this.isEditMode) {
      
    }
   
    const payload = {
  Order: {
    Id: this.isEditMode ? this.dataInput?.OrderId || 0 : 0,
    CustomerName: formValue.CustomerName,
    CustomerPhoneNumber: formValue.CustomerPhoneNumber,
    CustomerAddress: formValue.CustomerAddress,
    CustomerEmail: formValue.CustomerEmail,
  },

  SaleOrderDetailDTO: tableData.map((item: any, index: number) => ({
    OrderDetails: {
      Id: this.isEditMode ? item.Id || 0 : 0,
      OrderId: this.isEditMode ? this.dataInput?.OrderId || 0 : 0,
      STT: index + 1,
      ProductId: item.ProductId,
      Quantity: item.Quantity,
      Code: item.Code,
      DateStart: item.DateStart,
      DateEnd: item.DateEnd
    },

    OrderDetailInfo: [
      {
        Id: this.isEditMode ? item.OrderDetailInfoId || 0 : 0,
        SerialId: item.SerialId,
        ProductSerial: item.ProductSerial
      }
    ]
    
  })),

  DeletedOrder: this.DeletedOrder || []
};


    this.salesOrderService.saveDataSaleOder(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isEditMode
            ? 'Cập nhật thành công!'
            : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.close(true);
          console.log('Saved payload:', payload);
        } else {
          this.notification.warning(
            'Thông báo',
            res.message || 'Không thể lưu dữ liệu!'
          );
        }
      },
      error: (err) => {
        this.notification.error('Thông báo', 'Lỗi khi lưu dữ liệu!');
        console.error(err);
      },
    });
  }


  draw_OrderTable() {
    if (this.OrderTable) {
      this.OrderTable.replaceData(this.OrderData);
    } else {
      this.OrderTable = new Tabulator(this.tableRef1.nativeElement, {
        data: this.OrderData,
        layout: 'fitColumns',
        height: '100%',
        placeholder: 'Không có dữ liệu',
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        selectableRows: 1,
        columns: [
          {
            title: '',
            field: 'addRow',
            hozAlign: 'center',
            width: 40,
            headerSort: false,
            titleFormatter: () =>
              `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                <span class="add-icon" style="color: #52c41a; cursor: pointer; font-size: 18px; font-weight: bold;" title="Thêm dòng">+</span>
              </div>`,
            headerClick: () => {
              this.addRow();
            },
            formatter: () =>
              `<span class="delete-icon" style="color: #ff4d4f; cursor: pointer; font-size: 16px; font-weight: bold;" title="Xóa dòng">×</span>`,
            cellClick: (e, cell) => {
              if ((e.target as HTMLElement).classList.contains('delete-icon')) {
                this.modal.confirm({
                  nzTitle: 'Xác nhận xóa',
                  nzContent: 'Bạn có chắc chắn muốn xóa không?',
                  nzOkText: 'Đồng ý',
                  nzCancelText: 'Hủy',
                  nzOnOk: () => {
                    const row = cell.getRow();
                    const rowData = row.getData();
                    const rowIndex = this.OrderData.indexOf(rowData);
                    if (rowData['Id']) {
                      this.DeletedOrder.push(rowData['Id']);
                    }
                    row.delete();
                    this.OrderData =
                      this.OrderData.filter((x: any) => x !== rowData);
                  },
                });
              }
            },
          },
          {
            title: 'STT',
            hozAlign: 'center',
            formatter: 'rownum',
            headerHozAlign: 'center',
            field: 'STT',
            minWidth: 60,
          },
           {
            title: 'SO Code',
            field: 'Code',
            headerHozAlign: 'center',
            minWidth: 100,
            editor: 'input',
          },
         
          {
            title: 'Sản phẩm',
            field: 'ProductId',
            minWidth: 150,
            headerHozAlign: 'center',
             editor: this.createdControl(
                SelectControlComponent,
                this.injector,
                this.appRef,
                () => this.productOptions,
                {
                  valueField: 'value',
                  labelField: 'label',
                }
              ),
              formatter: (cell) => {
                const val = cell.getValue();
                if (!val) {
                  return '<div class="d-flex justify-content-between align-items-center"><p class="w-100 m-0 text-muted"></p> <i class="fas fa-angle-down"></i></div>';
                }
                const product = this.productOptions.find(
                  (p: any) => p.value === val
                );
                const productName = product ? product.Name : val;
                return `<div class="d-flex justify-content-between align-items-center"><p class="w-100 m-0">${productName}</p> <i class="fas fa-angle-down"></i></div>`;
              },
              cellEdited: (cell) => {
                const row = cell.getRow();
                const newValue = cell.getValue();
                const selectedProject = this.productOptions.find(
                  (p: any) => p.value === newValue
                );
                if (selectedProject) {
                  row.update({
                    ProductSerial: selectedProject.ProductSerial,
                    SerialId: selectedProject.SerialId
                  });
                }
              },
          },
            {
            title: 'Serial ID',
            field: 'SerialId',
            headerHozAlign: 'center',
            visible: false,
          },
          {
            title: 'Serial sản phẩm',
            field: 'ProductSerial',
            headerHozAlign: 'center',
            minWidth: 200,
            editor: 'textarea',
          },
           {
            title: 'Số lượng',
            hozAlign: 'center',
            editor: 'input',
            width: 90,
            headerHozAlign: 'center',
            field: 'Quantity',
          },
           {
              title: 'Ngày kích hoạt',
              field: 'DateStart',
              minWidth: 200,
              width: 200,
              headerHozAlign: 'center',
              editor: this.dateEditor.bind(this),
              cellEdited: (cell) => {
                const row = cell.getRow();
                const rowData = row.getData();
                if (!this.validateRowDates(rowData)) {
                  this.notification.warning(
                    'Thông báo',
                    'Ngày kích hoạt phải nhỏ hơn hạn bảo hành!'
                  );
                  const oldValue = (cell as any).getOldValue?.();
                  row.update({ DateStart: oldValue ?? '' });
                }
              },
            },
             {
              title: 'Ngày bảo hành',
              field: 'DateEnd',
              minWidth: 200,
              width: 200,
              headerHozAlign: 'center',
              editor: this.dateEditor.bind(this),
              cellEdited: (cell) => {
                const row = cell.getRow();
                const rowData = row.getData();
                if (!this.validateRowDates(rowData)) {
                  this.notification.warning(
                    'Thông báo',
                    'Hạn bảo hành phải lớn hơn ngày kích hoạt!'
                  );
                  const oldValue = (cell as any).getOldValue?.();
                  row.update({ DateEnd: oldValue ?? '' });
                }
              },
            },
        ],
      });
    }
  }
  addRow() {
    if (this.OrderTable) {
      this.OrderTable.addRow({
        ProductId: 0,
        SerialId: 0,
        Code: '',
        OrderDetailId: 0,
        ProductSerial: '',
        Quantity: 0,
        DateStart: '',
        DateEnd: '',
      });
    }
  }

  createdControl(
    component: Type<any>,
    injector: EnvironmentInjector,
    appRef: ApplicationRef,
    getData: () => any[],
    config: {
      valueField: string;
      labelField: string;
      placeholder?: string;
    }
  ) {
    return (cell: any, onRendered: any, success: any, cancel: any) => {
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.display = 'block';
      const componentRef = createComponent(component, {
        environmentInjector: injector,
      });

      const data = getData();
      componentRef.instance.id = cell.getValue();
      componentRef.instance.data = data;

      componentRef.instance.valueField = config.valueField;
      componentRef.instance.labelField = config.labelField;
      if (config.placeholder) {
        componentRef.instance.placeholder = config.placeholder;
      }

      componentRef.instance.valueChange.subscribe((val: any) => {
        success(val);
      });

      const hostEl = (componentRef.hostView as any).rootNodes[0];
      if (hostEl && hostEl.style) {
        hostEl.style.width = '100%';
        hostEl.style.display = 'block';
      }
      container.appendChild(hostEl);
      appRef.attachView(componentRef.hostView);
      onRendered(() => {});

      return container;
    };
  }
}
