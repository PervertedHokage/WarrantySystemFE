import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule, NgIf } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import {
  AngularGridInstance,
  AngularSlickgridModule,
  Column,
  DOMMouseOrTouchEvent,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
} from 'angular-slickgrid';
import { WarrantyClaim } from '../../../../models/warranty-claims/warranty-claim.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { WarrantyClaimManagementService } from '../../../../services/warranty-claim-management.service';
import { WarrantyManagmentModalComponent } from './warranty-managment-modal/warranty-managment-modal.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { WarrantyClaimDTO } from '../../../../models/warranty-claims/warranty-claim-dto.model';
import { WarrantyClaimExcelComponent } from './warranty-claim-excel/warranty-claim-excel.component';
@Component({
  selector: 'app-warranty-management',
  templateUrl: './warranty-management.component.html',
  styleUrls: ['./warranty-management.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    AngularSlickgridModule,
    NzModalModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzInputModule,
    NzDatePickerModule,
    NzCollapseModule,
  ],
})
export class WarrantyManagementComponent implements OnInit {
  angularGrid!: AngularGridInstance;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: WarrantyClaimDTO[] = [];
  statusMap: Record<number, { text: string; cls: string }> = {
    1: { text: 'Tiếp nhận thông tin', cls: 'status-badge status-1' },
    2: { text: 'Xác minh thông tin', cls: 'status-badge status-2' },
    3: { text: 'Chẩn đoán sơ bộ', cls: 'status-badge status-3' },
    4: { text: 'Báo giá', cls: 'status-badge status-4' },
    5: { text: 'Sửa chữa/bảo hành', cls: 'status-badge status-5' },
    6: { text: 'Hoàn trả', cls: 'status-badge status-6' },
  };
  showFilter = false;
  filter = {
    status: 0,
    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days prior
    toDate: new Date(),
    email: '',
    phoneNumber: '',
    claimNo: '',
  };
  currentFilter = 0;
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private warrantyService: WarrantyClaimManagementService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    this.initGrid();
  }
  ngAfterViewInit(): void {}
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }
  initGrid() {
    this.columnDefinitions = [
      {
        id: 'ClaimNo',
        name: 'Mã phiếu',
        field: 'ClaimNo',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CreatedDate',
        name: 'Ngày tạo',
        field: 'CreatedDate',
        sortable: true,
        type: 'dateUtc',
        formatter: Formatters.dateIso,
        filterable: true,
        filter: { model: Filters['compoundDate'] },
      },
      {
        id: 'CustomerName',
        name: 'Khách hàng',
        field: 'CustomerName',
        sortable: true,
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ProductName',
        name: 'Sản phẩm',
        field: 'ProductName',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'StatusText',
        name: 'Trạng thái',
        field: 'StatusText',
        cssClass: 'cell-center',
        filterable: true,
        filter: {
          model: Filters['compoundInputText'],
        },
        formatter: (_row, _cell, value, _col, item) => {
          const s = this.statusMap[item.Status];
          return s ? `<span class="${s.cls}">${s.text}</span>` : '';
        },
      },
      {
        id: 'Tracking',
        name: 'Thao tác',
        field: '_',
        cssClass: 'cell-center',
        sortable: false,
        filterable: false,
        excludeFromColumnPicker: true,
        formatter: (_row, _cell, _value, _colDef, dataContext) => {
          return `
            <button class="btn btn-sm btn-outline open-modal-btn">
              📋 Chi tiết
            </button>
          `;
        },
        onCellClick: (e: Event, args: OnEventArgs) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.open-modal-btn')) {
            return;
          }
          e.stopImmediatePropagation();
          const rowIndex = args.row;
          this.angularGrid.slickGrid.setSelectedRows([rowIndex]);
          this.angularGrid.slickGrid.setActiveCell(rowIndex, args.cell);
          this.openEditModal();
        },
      },
    ];
    this.gridOptions = {
      datasetIdPropertyName: 'Id',
      enableAutoResize: true,
      autoResize: {
        container: '#grid_warranty_container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      enableCellNavigation: true,
      rowHeight: 63,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
    };
    this.loadData();
  }
  loadData() {
    this.warrantyService
      .getWarrantyClaims(
        this.filter.phoneNumber,
        this.filter.email,
        this.filter.claimNo,
        this.filter.fromDate,
        this.filter.toDate,
        this.filter.status,
      )
      .subscribe({
        next: (res) => {
          this.dataset = res.data.map((d) => ({
            ...d,
            StatusText: this.getStatusText(d.Status ?? 0),
          }));
          this.angularGrid.dataView.setItems(this.dataset, 'Id');
          this.cdr.detectChanges();
          this.angularGrid.slickGrid.invalidate(); // fallback
          this.angularGrid.slickGrid.render();
        },
      });
  }
  filterStatus(status: number) {
    this.currentFilter = status;
    if (status == 0) {
      this.angularGrid.filterService.clearFilterByColumnId(
        {} as DOMMouseOrTouchEvent<HTMLDivElement>,
        'StatusText',
      );
    } else {
      const searchText = [this.statusMap[status].text];
      this.angularGrid.filterService.updateFilters([
        {
          columnId: 'StatusText',
          searchTerms: [this.statusMap[status].text],
          operator: '==',
        },
      ]);
    }
  }
  getStatusText(status: number) {
    return this.statusMap[status].text;
  }
  getStatusCount(status: number) {
    return this.dataset.filter((d) => d.Status == status).length;
  }
  openAddModal() {
    const modalRef = this.modal.create({
      nzTitle: 'Thêm mới phiếu bảo hành',
      nzContent: WarrantyManagmentModalComponent,
      nzFooter: [
        {
          label: 'Đóng',
          type: 'default',
          onClick: () => {
            modalRef.close();
          },
        },
        {
          label: 'Lưu thay đổi',
          type: 'primary',
          onClick: () => {
            const instance = modalRef.getContentComponent();
            if (instance.onSave()) {
              modalRef.close(true);
            }
          },
        },
      ],
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {},
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '95vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.loadData();
      }
    });
  }
  openEditModal() {
    const selectedData = this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedData.length) {
      this.notification.warning('Thông báo', 'Vui lòng chọn 1 phiếu bảo hành');
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: 'Chỉnh sửa phiếu bảo hành',
      nzContent: WarrantyManagmentModalComponent,
      nzFooter: [
        {
          label: 'Đóng',
          type: 'default',
          onClick: () => {
            modalRef.close(false);
          },
        },
        {
          label: 'Lưu thay đổi',
          type: 'primary',
          onClick: () => {
            const instance = modalRef.getContentComponent();
            if (instance.onSave()) {
              modalRef.close(true);
            }
          },
        },
      ],
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        warrantyClaim: selectedData[0],
      },
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '95vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        this.loadData();
      }
    });
  }
  onDelete() {
    const selectedData = this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedData.length) {
      this.notification.warning('Thông báo', 'Vui lòng chọn 1 phiếu bảo hành');
      return;
    }
    const confirmed = confirm('Bạn có chắc chắn muốn xóa?');
    if (!confirmed) return;
    this.warrantyService.delete(selectedData[0]).subscribe({
      next: () => {
        this.loadData();
      },
      error: () => {
        this.notification.error('Lỗi', 'Thao tác thất bại');
      },
    });
  }
  applyFilter() {
    this.loadData();
  }
  resetFilter() {
    this.filter = {
      status: 0,
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days prior
      toDate: new Date(),
      email: '',
      phoneNumber: '',
      claimNo: '',
    };
  }

  onImportExcel(): void {
    const modalRef = this.modal.create({
      nzTitle: 'Nhập dữ liệu Excel',
      nzContent: WarrantyClaimExcelComponent,
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
        this.loadData();
      }
    });
  }

  onExportExcel(): void {
    this.warrantyService
      .exportExcel(
        this.filter.phoneNumber,
        this.filter.email,
        this.filter.claimNo,
        this.filter.fromDate,
        this.filter.toDate,
        this.filter.status,
      )
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `WarrantyClaims_${new Date().getTime()}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.notification.error('Lỗi', 'Không thể xuất file Excel');
          console.error('Export error:', err);
        },
      });
  }
}
