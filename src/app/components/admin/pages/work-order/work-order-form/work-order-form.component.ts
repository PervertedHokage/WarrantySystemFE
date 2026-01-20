import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  DestroyRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
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
import { WorkOrderService } from '../../../../../services/work-order-service/work-order.service';
import { SelectControlComponent } from '../../select-control/select-control.component';
import { ProductService } from '../../../../../services/products-service/product.service';

@Component({
  selector: 'app-work-order-form',
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
  templateUrl: './work-order-form.component.html',
  styleUrl: './work-order-form.component.less',
})
export class WorkOrderFormComponent implements OnInit, AfterViewInit {
  @ViewChild('SparePartTable') tableRef1!: ElementRef;

  @Output() codeGenerated = new EventEmitter<string>();

  WorkOrderID: number = 0;
  isEditMode: boolean = false;
  dataInput: any | null = null;
  formGroup: FormGroup;

  dataEmployee: any[] = [];
  dataStatus: any[] = [];
  dataProducts: any[] = [];
  dataQuotation: any[] = [];
  dataSparePartGroup: any[] = [];
  dataWarrantyClaims: any[] = [];
  SparePartTable: Tabulator | null = null;

  SparePartGroupOptions: any;

  DeletedOrder: any[] = [];

  DeletedSpareSpart: any[] = [];

  sliderMarks: any = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%',
  };

  ngOnInit(): void {
    this.getdataEmployee();
    this.getdataProducts();
    this.getdataQuotation();
    this.setupQuotationChangeListener();
    this.getWarrantyClaims();
    this.getStatus();
    if (!this.isEditMode) {
      this.generateWorkOrderCode();
    }
    if (this.isEditMode && this.dataInput) {
      this.formGroup.patchValue({
        Code: this.dataInput.Code || '',
        WarrantyClaimId: this.dataInput.WarrantyClaimId || '',
        QuotationId: this.dataInput.QuotationId || '',
        CustomerName: this.dataInput.CustomerName || '',
        DateStart: this.formatDateForInput(this.dataInput.DateStart),
        CompletedDate: this.formatDateForInput(this.dataInput.CompletedDate),
        UserId: this.dataInput.UserId || '',
        Status: this.dataInput.StatusId || '',
        ProductId: this.dataInput.ProductId || '',
        DateEnd: this.formatDateForInput(this.dataInput.DateEnd),
        ProgressComplete: this.dataInput.ProgressComplete || '',
        Description: this.dataInput.Description || '',
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.draw_SparePartTable();
      if (this.isEditMode && this.WorkOrderID) {
        this.loadSpareSpartData();
      }
    }, 100);
  }

  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { WorkOrderID: number; isEditMode: boolean; dataInput: any },
    private fb: FormBuilder,
    private modal: NzModalService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private workOrderService: WorkOrderService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private injector: EnvironmentInjector,
    private appRef: ApplicationRef
  ) {
    if (data) {
      this.WorkOrderID = data.WorkOrderID || 0;
      this.isEditMode = data.isEditMode || false;
      this.dataInput = data.dataInput || null;
    }
    this.formGroup = this.fb.group({
      Code: [null, [Validators.maxLength(50)]],
      WarrantyClaimId: [null, [Validators.required, Validators.maxLength(50)]],
      QuotationId: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      CustomerName: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      DateStart: ['', [Validators.required, Validators.maxLength(50)]],
      CompletedDate: ['', [Validators.required, Validators.maxLength(50), this.completedDateValidator.bind(this)]],
      UserId: ['', [Validators.required, Validators.maxLength(100)]],
      ProductId: [{ value: '', disabled: true }, [Validators.required]],
      Description: ['', [Validators.maxLength(1000)]],
      Status: ['New', [Validators.required]],
      ProgressComplete: [0, [Validators.required]],
      DateEnd: ['', [Validators.required, this.dateEndValidator.bind(this)]],
    });
  }

  close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

  private dateEndValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const dateEnd = new Date(control.value);
    const dateStart = this.formGroup?.get('DateStart')?.value;

    if (!dateStart) return null;

    const startDate = new Date(dateStart);

    if (dateEnd <= startDate) {
      return { dateEndInvalid: true };
    }

    return null;
  } 

  private completedDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const completedDate = new Date(control.value);
    const dateStart = this.formGroup?.get('DateStart')?.value;

    if (!dateStart) return null;

    const startDate = new Date(dateStart);

    if (completedDate <= startDate) {
      return { completedDateInvalid: true };
    }

    return null;
  }

  filterOption = (input: string, option: any): boolean => {
    if (!input) return true;
    const searchText = input.toLowerCase();
    const label = option.nzLabel?.toLowerCase() || '';
    return label.includes(searchText);
  };

  loadSpareSpartData() {
    if (!this.WorkOrderID) {
      return;
    }

    this.workOrderService.getWorkOrderDetail(this.WorkOrderID).subscribe({
      next: (response) => {
        const issues = response?.data || [];

        this.dataSparePartGroup = issues.map((item: any) => ({
          Id: item.WorkOrderSpareId || 0,
          SparePartGroupId: item.SparePartGroupId || '',
          Quantity: item.Quantity || '',
        }));

        if (this.SparePartTable) {
          this.SparePartTable.setData(this.dataSparePartGroup);
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

  getdataEmployee() {
    this.workOrderService.getEmployees(0).subscribe((response: any) => {
      this.dataEmployee = response.data || [];
    });
  }

  getStatus() {
    this.workOrderService.getStatus().subscribe((response: any) => {
      this.dataStatus = response.data || [];
    });
  }

  getdataProducts() {
    this.workOrderService.getDataProducts().subscribe((response: any) => {
      this.dataProducts = response.data || [];
    });
  }

   getWarrantyClaims() {
    this.workOrderService
      .getWarrantyClaim(0)
      .subscribe((response: any) => {
        this.dataWarrantyClaims = response?.data || [];
        this.loadOptionSparePartGroup();
      });
  }

  getdataQuotation() {
    this.workOrderService.getQuotation().subscribe((response: any) => {
      this.dataQuotation = response.data || [];
    });
  }

  setupQuotationChangeListener() {
    this.formGroup
      .get('WarrantyClaimId')
      ?.valueChanges.subscribe((quotationId) => {
        if (quotationId) {
          const selectedQuotation = this.dataWarrantyClaims.find(
            (q) => q.Id === quotationId
          );
          if (selectedQuotation && selectedQuotation.CustomerName) {
            this.formGroup.patchValue({
              CustomerName: selectedQuotation.CustomerName,
              QuotationId: selectedQuotation.QuotationId,
            });
          }
           if (selectedQuotation && selectedQuotation.ProductId) {
            this.formGroup.patchValue({
              ProductId: selectedQuotation.ProductId,
            });
          }

          this.loadOptionSparePartGroup();
        }
      });
  }

  percentFormatter = (value: number): string => `${value} %`;
  percentParser = (value: string): number => {
    const parsed = value.replace(' %', '').replace('%', '');
    return Number(parsed) || 0;
  };

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateWorkOrderCode() {
    this.workOrderService.getWorkOrder(0).subscribe({
      next: (res: any) => {
        const currentYear = new Date().getFullYear();
        const workOrders = res.data?.asset || res.data || [];

        const currentYearOrders = workOrders.filter((wo: any) => {
          return wo.Code && wo.Code.startsWith(`WO-${currentYear}`);
        });

        let maxNumber = 0;
        currentYearOrders.forEach((wo: any) => {
          const match = wo.Code.match(/WO-\d{4}-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        });

        const nextNumber = maxNumber + 1;
        const paddedNumber = nextNumber.toString().padStart(3, '0');
        const newCode = `WO-${currentYear}-${paddedNumber}`;

        this.formGroup.patchValue({ Code: newCode });
        this.codeGenerated.emit(newCode);
        this.cdr.detectChanges();
      },
      error: (err) => {
        const currentYear = new Date().getFullYear();
        const defaultCode = `WO-${currentYear}-001`;
        this.formGroup.patchValue({ Code: defaultCode });
        this.codeGenerated.emit(defaultCode);
        this.cdr.detectChanges();
      },
    });
  }

  loadOptionSparePartGroup() {
    const warrantyClaimId = this.formGroup?.get('WarrantyClaimId')?.value;

    const selectedClaim = this.dataWarrantyClaims?.find(
      (x: any) => x?.Id === warrantyClaimId
    );

    const productId =
      Number(selectedClaim?.ProductId) || Number(this.dataInput?.ProductId) || 0;

    if (!productId) {
      this.SparePartGroupOptions = [];
      return;
    }

    this.productService.getSparePart(productId).subscribe({
      next: (res: any) => {
        const productData = res.data;
        if (Array.isArray(productData)) {
          this.SparePartGroupOptions = productData
            .filter(
              (item) =>
                item.GroupId !== null && item.GroupId !== undefined && item.GroupId !== 0
            )
            .map((data) => ({
              label: data.Name,
              value: data.GroupId,
              // Code: data.Code,
              Name: data.Name,
            }));
        } else {
          this.SparePartGroupOptions = [];
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

  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

  saveWorkOrderData() {
    this.trimAllStringControls();

    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const tableData = this.SparePartTable?.getData() || [];

    if (tableData.length === 0) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng thêm ít nhất 1 linh kiện sử dụng!'
      );
      return;
    }

    const formValue = this.formGroup.getRawValue();
    if (this.isEditMode) {
    }
    const payload = {
      WorkOrder: {
        Id: this.isEditMode ? this.dataInput?.Id || 0 : 0,
        // Code: formValue.Code,
        WarrantyClaimsId: formValue.WarrantyClaimId,
        QuotationId: formValue.QuotationId,
        DateStart: formValue.DateStart,
        CompletedDate: formValue.CompletedDate,
        UsersId: formValue.UserId,
        StatusId: formValue.Status,
        ProductId: formValue.ProductId,
        DateEnd: formValue.DateEnd,
        ProgressComplete: formValue.ProgressComplete,
        Description: formValue.Description,
      },

      WorkOrderSpareParts: tableData.map((item: any, index: number) => ({
        Id: this.isEditMode ? item.Id : 0,
        SparePartGroupId: item.SparePartGroupId || '',
        Quantity: item.Quantity || '',
      })),

      DeletedSpareSpart: this.DeletedSpareSpart || [],
    };
    this.workOrderService.saveDataWorkOrder(payload).subscribe({
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
        this.notification.error(
          NOTIFICATION_TITLE.error,
          err?.error?.message || err?.message
        );
      },
    });
  }

  draw_SparePartTable() {
    if (this.SparePartTable) {
      this.SparePartTable.replaceData(this.dataSparePartGroup);
    } else {
      this.SparePartTable = new Tabulator(this.tableRef1.nativeElement, {
        data: this.dataSparePartGroup,
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
                    const rowIndex = this.dataSparePartGroup.indexOf(rowData);
                    if (rowData['Id']) {
                      this.DeletedSpareSpart.push(rowData['Id']);
                    }
                    row.delete();
                    this.dataSparePartGroup = this.dataSparePartGroup.filter(
                      (x) => x !== rowData
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
            field: 'SparePartGroupId',
            headerHozAlign: 'center',
            editor: this.createdControl(
              SelectControlComponent,
              this.injector,
              this.appRef,
              () => this.SparePartGroupOptions,
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
              const product = this.SparePartGroupOptions.find(
                (p: any) => p.value === val
              );
              const productName = product ? product.Name : val;
              return `<div class="d-flex justify-content-between align-items-center"><p class="w-100 m-0">${productName}</p> <i class="fas fa-angle-down"></i></div>`;
            },
            cellEdited: (cell) => {
              const row = cell.getRow();
              const newValue = cell.getValue();
              const selectedProject = this.SparePartGroupOptions.find(
                (p: any) => p.value === newValue
              );
            },
          },
          {
            title: 'Số lượng',
            field: 'Quantity',
            headerHozAlign: 'center',
            minWidth: 50,
            maxWidth: 100,
            editor: 'input',
          },
        ],
      });
    }
  }
  addRow() {
    if (this.SparePartTable) {
      this.SparePartTable.addRow({
        Quantity: '',
        SparePartGroupId: '',
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
