import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule, NgIf } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HasPermissionDirective } from '../../../../directives/has-permission.directive';
import { NOTIFICATION_TITLE } from '../../../../app.config';
import { forkJoin } from 'rxjs';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import { OrganizationService } from '../organization/organization.service';
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
import { WarrantyClaim } from '../../../../models/warranty-claim.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { WarrantyClaimManagementService } from '../../../../services/warranty-claim-management.service';
import { WarrantyManagmentModalComponent } from './warranty-managment-modal/warranty-managment-modal.component';

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
  ],
})
export class WarrantyManagementComponent implements OnInit {
  angularGrid!: AngularGridInstance;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: WarrantyClaim[] = [];
  statusMap: Record<number, { text: string; cls: string }> = {
    1: { text: 'Tiếp nhận thông tin', cls: 'status-badge status-1' },
    2: { text: 'Xác minh thông tin', cls: 'status-badge status-2' },
    3: { text: 'Chẩn đoán sơ bộ', cls: 'status-badge status-3' },
    4: { text: 'Báo giá', cls: 'status-badge status-4' },
    5: { text: 'Sửa chữa/bảo hành', cls: 'status-badge status-5' },
    6: { text: 'Hoàn trả', cls: 'status-badge status-6' },
  };
  currentFilter = 0;
  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private warrantyService: WarrantyClaimManagementService
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
        formatter: Formatters.dateTimeIsoAmPm,
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
        container: '.tab-content',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableCellNavigation: true,
      rowHeight: 62.75,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
    };
    this.dataset = [
      new WarrantyClaim({
        Id: 1,
        ClaimNo: 'WC-0001',
        CustomerName: 'Nguyen Van A',
        CustomerEmail: 'a@example.com',
        CustomerPhoneNumber: '0901000001',
        CustomerAddress: 'Hanoi',
        ProductName: 'Laptop X1',
        ProductId: 101,
        IssueId: 1,
        SerialNumber: 'SN-X1-0001',
        HasProtection: true,
        HasAdapter: true,
        HasCable: true,
        HasBattery: true,
        HasIssueWhenOpenBox: false,
        HasCollision: false,
        OperationEnvironment: 1,
        Status: 1,
        StatusText: this.getStatusText(1),
        Type: 1,
        FileAddress: null,
        Transporter: 'DHL',
        LadingNumber: 'LD0001',
        Note: '',
        RecipientAddress: 'Hanoi Service Center',
        CreatedDate: new Date('2025-01-01'),
        CreatedBy: 'admin',
      }),

      new WarrantyClaim({
        Id: 2,
        ClaimNo: 'WC-0002',
        CustomerName: 'Tran Thi B',
        CustomerEmail: 'b@example.com',
        CustomerPhoneNumber: '0901000002',
        CustomerAddress: 'Ho Chi Minh City',
        ProductName: 'Phone Z',
        ProductId: 102,
        IssueId: 2,
        SerialNumber: 'SN-Z-0002',
        HasProtection: false,
        HasAdapter: true,
        HasCable: true,
        HasBattery: true,
        HasIssueWhenOpenBox: true,
        HasCollision: false,
        OperationEnvironment: 2,
        Status: 5,
        StatusText: this.getStatusText(5),
        Type: 1,
        Transporter: 'VNPost',
        LadingNumber: 'LD0002',
        Note: 'Screen issue',
        RecipientAddress: 'HCM Service Center',
        CreatedDate: new Date('2025-01-02'),
        CreatedBy: 'admin',
      }),

      new WarrantyClaim({
        Id: 3,
        ClaimNo: 'WC-0003',
        CustomerName: 'Le Van C',
        CustomerPhoneNumber: '0901000003',
        ProductName: 'Tablet T',
        ProductId: 103,
        IssueId: 3,
        SerialNumber: 'SN-T-0003',
        HasProtection: true,
        HasAdapter: false,
        HasCable: false,
        HasBattery: true,
        HasIssueWhenOpenBox: false,
        HasCollision: true,
        OperationEnvironment: 1,
        Status: 3,
        StatusText: this.getStatusText(3),
        Type: 2,
        Note: 'Physical damage',
        CreatedDate: new Date('2025-01-03'),
        CreatedBy: 'staff01',
      }),

      new WarrantyClaim({
        Id: 4,
        ClaimNo: 'WC-0004',
        CustomerName: 'Pham Thi D',
        CustomerEmail: 'd@example.com',
        CustomerPhoneNumber: '0901000004',
        ProductName: 'Monitor M24',
        ProductId: 104,
        IssueId: 1,
        SerialNumber: 'SN-M24-0004',
        HasProtection: true,
        HasAdapter: true,
        HasCable: true,
        HasBattery: null,
        HasIssueWhenOpenBox: false,
        HasCollision: false,
        OperationEnvironment: 3,
        Status: 1,
        StatusText: this.getStatusText(1),
        Type: 1,
        CreatedDate: new Date('2025-01-04'),
        CreatedBy: 'staff02',
      }),

      new WarrantyClaim({
        Id: 5,
        ClaimNo: 'WC-0005',
        CustomerName: 'Hoang Van E',
        CustomerPhoneNumber: '0901000005',
        CustomerAddress: 'Da Nang',
        ProductName: 'Printer P',
        ProductId: 105,
        IssueId: 4,
        SerialNumber: 'SN-P-0005',
        HasProtection: false,
        HasAdapter: true,
        HasCable: true,
        HasBattery: null,
        HasIssueWhenOpenBox: false,
        HasCollision: false,
        OperationEnvironment: 2,
        Status: 6,
        StatusText: this.getStatusText(6),
        Type: 2,
        Note: 'Paper jam',
        CreatedDate: new Date('2025-01-05'),
        CreatedBy: 'admin',
      }),
      ...Array.from({ length: 15 }).map(
        (_, i) =>
          new WarrantyClaim({
            Id: 6 + i,
            ClaimNo: `WC-00${6 + i}`,
            CustomerName: `Customer ${6 + i}`,
            CustomerPhoneNumber: `09010000${6 + i}`,
            ProductName: `Product ${i + 1}`,
            ProductId: 200 + i,
            IssueId: (i % 5) + 1,
            SerialNumber: `SN-${i + 1}`,
            HasProtection: i % 2 === 0,
            HasAdapter: true,
            HasCable: true,
            HasBattery: i % 3 === 0,
            HasIssueWhenOpenBox: false,
            HasCollision: false,
            OperationEnvironment: (i % 3) + 1,
            Status: (i % 6) + 1,
            StatusText: this.getStatusText((i % 6) + 1),
            Type: (i % 2) + 1,
            CreatedDate: new Date(2025, 0, 6 + i),
            CreatedBy: 'system',
          })
      ),
    ];
  }
  filterStatus(status: number) {
    this.currentFilter = status;
    if (status == 0) {
      this.angularGrid.filterService.clearFilterByColumnId(
        {} as DOMMouseOrTouchEvent<HTMLDivElement>,
        'StatusText'
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
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {},
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '80vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
      }
    });
  }
  openEditModal() {
    const selectedData = this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedData.length) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn 1 phiếu bảo hành'
      );
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: 'Chỉnh sửa phiếu bảo hành',
      nzContent: WarrantyManagmentModalComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        warrantyClaim: selectedData[0],
      },
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '80vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
      }
    });
  }
}
