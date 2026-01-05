import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  EnvironmentInjector,
  ApplicationRef,
  Type,
  createComponent,
  OnDestroy,
} from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ChangeDetectorRef } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';

import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';
import { NOTIFICATION_TITLE } from '../../../../../../app/app.config';
import { ProductService } from '../../../../../services/products-service/product.service';
import { SelectControlComponent } from '../../select-control/select-control.component';

@Component({
  selector: 'app-products-form-v2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSliderModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzSplitterModule,
    NzCheckboxModule,
    NzSelectModule,
    NzTabsModule,
  ],
  templateUrl: './products-form-v2.component.html',
  styleUrl: './products-form-v2.component.less',
})
export class ProductsFormV2Component implements OnInit, AfterViewInit {
  @ViewChild('sparePartTable') tableRef1!: ElementRef;

  ProductID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  formGroup: FormGroup;

  sparePartData: any;
  sparePartTable: Tabulator | null = null;

  UnitOptions: any[] = [];
  DeletedSparePartGroup: any[] = [];

  ngOnInit(): void {
    if ( this.dataInput) {
      this.formGroup.patchValue({
        Name: this.dataInput.Name || '',
        Code: this.dataInput.Code || '',
        Description: this.dataInput.Description || '',
      });
      // this.loadsparePartDetailData();
    }

    this.loadOptionUnit();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.draw_SparePartTable();
      if (this.ProductID) {
        this.loadsparePartDetailData();
      }
    }, 100);
  }

  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { ProductID: number; isEditMode: boolean; dataInput: any },
    private fb: FormBuilder,
    private modal: NzModalService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {
    if (data) {
      this.ProductID = data.ProductID || 0;
      this.isEditMode = data.isEditMode || false;
      this.dataInput = data.dataInput || null;
    }
    this.formGroup = this.fb.group({
      Name: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      Code: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(20)]],
      Description: [{ value: '', disabled: true }, [Validators.maxLength(500)]],
    });
  }

  loadsparePartDetailData() {
    this.productService.getSparePart(this.ProductID).subscribe({
      next: (response) => {
        const sparePartData = response?.data || [];
        this.sparePartData = sparePartData.map((item: any) => ({
          Id: item.Id || 0,
          GroupId: item.SparePartGroupId || item.GroupId || 0,
          Name: item.Name || '',
          SparePartNumber: item.SparePartNumber || '',
          Description: item.Description || '',
          UnitId: item.UnitId || null,
          UnitName: item.UnitName || '',
        }));
        if (this.sparePartTable) {
          this.sparePartTable.setData(this.sparePartData);
        }
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          err?.error?.message || err?.message
        );
      },
    });
  }

  loadOptionUnit() {
    this.productService.getDataUnit().subscribe({
      next: (res: any) => {
        const productData = res.data;
        if (Array.isArray(productData)) {
          this.UnitOptions = productData
            .filter(
              (item) =>
                item.Id !== null && item.Id !== undefined && item.Id !== 0
            )
            .map((data) => ({
              label: data.Name,
              value: data.Id,
              // Code: data.Code,
              Name: data.Name,
            }));
        } else {
          this.UnitOptions = [];
        }
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          err?.error?.message || err?.message
        );
      },
    });
  }

  private getMissingTableColumns(tableData: any[]): string[] {
    const rows = Array.isArray(tableData) ? tableData : [];
    const missing = new Set<string>();

    const isEmpty = (v: any) =>
      v === null || v === undefined || String(v).trim() === '';

    rows.forEach((row: any) => {
      if (isEmpty(row?.Name)) missing.add('Tên linh kiện');
      if (isEmpty(row?.SparePartNumber)) missing.add('Mã linh kiện');
      if (isEmpty(row?.Description)) missing.add('Mô tả');

      const qty = Number(row?.UnitId);
      if (!qty || Number.isNaN(qty) || qty <= 0) missing.add('Đơn vị');
    });

    return Array.from(missing);
  }

  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

  saveProductData() {
    this.trimAllStringControls();

    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const tableData = this.sparePartTable?.getData() || [];

    if (tableData.length === 0) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng thêm ít nhất 1 linh kiện!'
      );
      return;
    }

    const missingColumns = this.getMissingTableColumns(tableData);
    if (missingColumns.length) {
      this.notification.warning(
        'Thông báo',
        `Vui lòng nhập đầy đủ các cột: ${missingColumns.join(', ')}`
      );
      return;
    }

    const formValue = this.formGroup.getRawValue();

    const payload = {
      Product: {
        Id:  this.dataInput?.Id,
        Code: formValue.Code || '',
        Name: formValue.Name || '',
        Description: formValue.Description || '',
      },

      SparePartsGroups: tableData.map((item: any, index: number) => ({
        SparePartsGroup: {
          Id: item.GroupId ,
          ProductId: this.isEditMode ? this.dataInput?.ProductId || 0 : 0,
          STT: index + 1,
          Name: item.Name,
        },

        SparePart: [
          {
            Id: item.Id,
            Description: item.Description,
            SparePartNumber: item.SparePartNumber,
            UnitId: item.UnitId,
          },
        ],
      })),

      DeletedSparePartGroup: this.DeletedSparePartGroup || [],
    };

    this.productService.saveDataProduct(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isEditMode
            ? 'Cập nhật thành công!'
            : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.close(true);
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

  close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

  draw_SparePartTable() {
    if (this.sparePartTable) {
      this.sparePartTable.replaceData(this.sparePartData);
    } else {
      this.sparePartTable = new Tabulator(this.tableRef1.nativeElement, {
        data: this.sparePartData,
        layout: 'fitDataStretch',
        height: '100%',
        placeholder: 'Không có dữ liệu',
        movableColumns: true,
        resizableRows: true,
        // reactiveData: true,
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
                    const rowIndex = this.sparePartData.indexOf(rowData);
                    if (rowData['GroupId']) {
                      this.DeletedSparePartGroup.push(rowData['GroupId']);
                    }
                    row.delete();
                    this.sparePartData = this.sparePartData.filter(
                      (x: any) => x !== rowData
                    );
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
            minWidth: 50,
            maxWidth: 100,
          },
          {
            title: 'Tên linh kiện',
            field: 'Name',
            headerHozAlign: 'center',
            minWidth: 150,
            maxWidth: 200,
            editor: 'input',
          },
          {
            title: 'Mã linh kiện',
            field: 'SparePartNumber',
            headerHozAlign: 'center',
            minWidth: 200,
            maxWidth: 200,
            editor: 'input',
          },
          {
            title: 'Mô tả',
            field: 'Description',
            headerHozAlign: 'center',
            minWidth: 400,
            maxWidth: 500,
            editor: 'input',
            formatter: 'textarea',
          },
          {
            title: 'Đơn vị',
            field: 'UnitId',
            minWidth: 50,
            maxWidth: 100,
            headerHozAlign: 'center',
            editor: this.createdControl(
              SelectControlComponent,
              this.injector,
              this.appRef,
              () => this.UnitOptions,
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
              const product = this.UnitOptions.find(
                (p: any) => p.value === val
              );
              const productName = product ? product.Name : val;
              return `<div class="d-flex justify-content-between align-items-center"><p class="w-100 m-0">${productName}</p> <i class="fas fa-angle-down"></i></div>`;
            },
            cellEdited: (cell) => {
              const row = cell.getRow();
              const newValue = cell.getValue();
              const selectedProject = this.UnitOptions.find(
                (p: any) => p.value === newValue
              );
            },
          },
        ],
      });
    }
  }
  addRow() {
    if (this.sparePartTable) {
      this.sparePartTable.addRow({
        STT: 0,
        Name: '',
        SparePartNumber: '',
        Description: '',
        UnitId: 0,
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
