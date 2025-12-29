import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  Input,
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
import { WarrantyClaim } from '../../../../models/warranty-claims/warranty-claim.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { QuotationDTO } from '../../../../models/quotations/quotation-dto.model';
import { QuotationModalComponent } from './quotation-modal/quotation-modal.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { QuotationService } from '../../../../services/quotations-service/quotation.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Quotation } from '../../../../models/quotations/quotation.model';

@Component({
  selector: 'quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    AngularSlickgridModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzDatePickerModule,
    NzIconModule,
  ],
})
export class QuotationComponent implements OnInit {
  @Input() claimNo: string = '';
  angularGrid!: AngularGridInstance;
  gridId = `grid-quotation-${crypto.randomUUID()}`;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: QuotationDTO[] = [];
  statusMap: Record<number, { text: string; cls: string }> = {
    1: { text: 'Đã gửi', cls: 'status-badge status-1' },
    2: { text: 'Chưa gửi', cls: 'status-badge status-2' },
    3: { text: 'Đã duyệt', cls: 'status-badge status-3' },
    4: { text: 'Đã từ chối', cls: 'status-badge status-4' },
    5: { text: 'Hết hạn', cls: 'status-badge status-5' },
  };
  showFilter = false;
  filter = {
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    toDate: new Date(),
    claimNo: this.claimNo,
  };
  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private quotationService: QuotationService
  ) {}

  ngOnInit() {
    this.initGrid();
  }
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }
  initGrid() {
    this.columnDefinitions = [
      {
        id: 'QuotationNumber',
        name: 'Mã báo giá',
        field: 'QuotationNumber',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ClaimNo',
        name: 'Mã yêu cầu',
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
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ProductName',
        name: 'Sản phẩm',
        field: 'ProductName',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'StatusQuotationText',
        name: 'Trạng thái',
        field: 'StatusQuotationText',
        cssClass: 'cell-center',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
        formatter: (_row, _cell, value, _col, item) => {
          const s = this.statusMap[item.StatusQuotation];
          return s ? `<span class="${s.cls}">${s.text}</span>` : '';
        },
      },
      {
        id: 'DeadLine',
        name: 'Hạn báo giá',
        field: 'DeadLine',
        sortable: true,
        type: 'dateUtc',
        formatter: Formatters.dateIso,
        filterable: true,
        filter: { model: Filters['compoundDate'] },
      },
      {
        id: 'Actions',
        name: 'Thao tác',
        field: '',
        cssClass: 'cell-center',
        sortable: false,
        filterable: false,
        width: 100,
        formatter: () => `
          <button class="btn btn-sm btn-outline open-modal-btn">
            📋 Chi tiết
          </button>
        `,
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
        container: '#grid_quotation_container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableCellNavigation: true,
      rowHeight: 63,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
    };
    this.loadData();
    // this.dataset = [
    //   new QuotationDTO({
    //     Id: 1,
    //     QuotationNumber: 'BG-2024-001',
    //     WarrantyClaimId: 1,
    //     ClaimNo: 'WR-2024-001',
    //     CustomerName: 'Nguyễn Văn A',
    //     CustomerEmail: 'a.nguyen@email.com',
    //     CustomerPhoneNumber: '0901000001',
    //     CustomerAddress: 'Hà Nội',
    //     ProductSerialId: 101,
    //     StatusQuotation: 1,
    //     StatusQuotationText: 'Đã gửi KH',
    //     DeadLine: new Date('2024-12-24'),
    //     CreatedDate: new Date('2024-12-17'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 2,
    //     QuotationNumber: 'BG-2024-002',
    //     WarrantyClaimId: 2,
    //     ClaimNo: 'WR-2024-002',
    //     CustomerName: 'Trần Thị B',
    //     CustomerEmail: 'b.tran@email.com',
    //     CustomerPhoneNumber: '0901000002',
    //     CustomerAddress: 'Hồ Chí Minh',
    //     ProductSerialId: 102,
    //     StatusQuotation: 2,
    //     StatusQuotationText: 'Đã duyệt',
    //     DeadLine: new Date('2024-12-23'),
    //     CreatedDate: new Date('2024-12-16'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 3,
    //     QuotationNumber: 'BG-2024-003',
    //     WarrantyClaimId: 3,
    //     ClaimNo: 'WR-2024-003',
    //     CustomerName: 'Lê Văn C',
    //     CustomerEmail: 'c.le@email.com',
    //     CustomerPhoneNumber: '0901000003',
    //     CustomerAddress: 'Đà Nẵng',
    //     ProductSerialId: 103,
    //     StatusQuotation: 3,
    //     StatusQuotationText: 'Đã từ chối',
    //     DeadLine: new Date('2024-12-22'),
    //     CreatedDate: new Date('2024-12-15'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 4,
    //     QuotationNumber: 'BG-2024-004',
    //     WarrantyClaimId: 4,
    //     ClaimNo: 'WR-2024-004',
    //     CustomerName: 'Phạm Thị D',
    //     CustomerEmail: 'd.pham@email.com',
    //     CustomerPhoneNumber: '0901000004',
    //     CustomerAddress: 'Cần Thơ',
    //     ProductSerialId: 104,
    //     StatusQuotation: 0,
    //     StatusQuotationText: 'Chờ gửi',
    //     DeadLine: new Date('2024-12-21'),
    //     CreatedDate: new Date('2024-12-14'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 5,
    //     QuotationNumber: 'BG-2024-005',
    //     WarrantyClaimId: 5,
    //     ClaimNo: 'WR-2024-005',
    //     CustomerName: 'Hoàng Văn E',
    //     CustomerEmail: 'e.hoang@email.com',
    //     CustomerPhoneNumber: '0901000005',
    //     CustomerAddress: 'Hải Phòng',
    //     ProductSerialId: 105,
    //     StatusQuotation: 1,
    //     StatusQuotationText: 'Đã gửi KH',
    //     DeadLine: new Date('2024-12-20'),
    //     CreatedDate: new Date('2024-12-13'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 6,
    //     QuotationNumber: 'BG-2024-006',
    //     WarrantyClaimId: 6,
    //     ClaimNo: 'WR-2024-006',
    //     CustomerName: 'Vũ Thị F',
    //     CustomerEmail: 'f.vu@email.com',
    //     CustomerPhoneNumber: '0901000006',
    //     CustomerAddress: 'Bình Dương',
    //     ProductSerialId: 106,
    //     StatusQuotation: 4,
    //     StatusQuotationText: 'Hết hạn',
    //     DeadLine: new Date('2024-12-05'),
    //     CreatedDate: new Date('2024-12-12'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 7,
    //     QuotationNumber: 'BG-2024-007',
    //     WarrantyClaimId: 7,
    //     ClaimNo: 'WR-2024-007',
    //     CustomerName: 'Đặng Văn G',
    //     CustomerEmail: 'g.dang@email.com',
    //     CustomerPhoneNumber: '0901000007',
    //     CustomerAddress: 'Quảng Ninh',
    //     ProductSerialId: 107,
    //     StatusQuotation: 2,
    //     StatusQuotationText: 'Đã duyệt',
    //     DeadLine: new Date('2024-12-18'),
    //     CreatedDate: new Date('2024-12-11'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 8,
    //     QuotationNumber: 'BG-2024-008',
    //     WarrantyClaimId: 8,
    //     ClaimNo: 'WR-2024-008',
    //     CustomerName: 'Bùi Thị H',
    //     CustomerEmail: 'h.bui@email.com',
    //     CustomerPhoneNumber: '0901000008',
    //     CustomerAddress: 'Nghệ An',
    //     ProductSerialId: 108,
    //     StatusQuotation: 1,
    //     StatusQuotationText: 'Đã gửi KH',
    //     DeadLine: new Date('2024-12-17'),
    //     CreatedDate: new Date('2024-12-10'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 9,
    //     QuotationNumber: 'BG-2024-009',
    //     WarrantyClaimId: 9,
    //     ClaimNo: 'WR-2024-009',
    //     CustomerName: 'Phan Văn I',
    //     CustomerEmail: 'i.phan@email.com',
    //     CustomerPhoneNumber: '0901000009',
    //     CustomerAddress: 'Huế',
    //     ProductSerialId: 109,
    //     StatusQuotation: 0,
    //     StatusQuotationText: 'Chờ gửi',
    //     DeadLine: new Date('2024-12-19'),
    //     CreatedDate: new Date('2024-12-09'),
    //     CreatedBy: 'admin',
    //   }),
    //   new QuotationDTO({
    //     Id: 10,
    //     QuotationNumber: 'BG-2024-010',
    //     WarrantyClaimId: 10,
    //     ClaimNo: 'WR-2024-010',
    //     CustomerName: 'Ngô Thị K',
    //     CustomerEmail: 'k.ngo@email.com',
    //     CustomerPhoneNumber: '0901000010',
    //     CustomerAddress: 'Hà Nam',
    //     ProductSerialId: 110,
    //     StatusQuotation: 3,
    //     StatusQuotationText: 'Đã từ chối',
    //     DeadLine: new Date('2024-12-16'),
    //     CreatedDate: new Date('2024-12-08'),
    //     CreatedBy: 'admin',
    //   }),
    //   ...Array.from(
    //     { length: 10 },
    //     (_, i) =>
    //       new QuotationDTO({
    //         Id: 11 + i,
    //         QuotationNumber: `BG-2024-${String(11 + i).padStart(3, '0')}`,
    //         WarrantyClaimId: 11 + i,
    //         ClaimNo: `WR-2024-${String(11 + i).padStart(3, '0')}`,
    //         CustomerName: `Khách hàng ${11 + i}`,
    //         CustomerEmail: `customer${11 + i}@email.com`,
    //         CustomerPhoneNumber: `09010000${11 + i}`,
    //         CustomerAddress: 'Việt Nam',
    //         ProductSerialId: 200 + i,
    //         StatusQuotation: i % 5,
    //         StatusQuotationText: [
    //           'Chờ gửi',
    //           'Đã gửi KH',
    //           'Đã duyệt',
    //           'Đã từ chối',
    //           'Hết hạn',
    //         ][i % 5],
    //         DeadLine: new Date(2024, 11, 25 - i),
    //         CreatedDate: new Date(2024, 11, 7 - i),
    //         CreatedBy: 'admin',
    //       })
    //   ),
    // ];
  }
  loadData() {
    this.quotationService
      .getAll(
        this.filter.fromDate,
        this.filter.toDate,
        this.filter.claimNo.trim()
      )
      .subscribe({
        next: (res) => {
          this.dataset = res.data;
        },
        error: (err) => {
          this.notification.error(
            NOTIFICATION_TITLE.error,
            'Load dữ liệu thất bại'
          );
        },
      });
  }
  openAddModal() {
    const modalRef = this.modal.create({
      nzTitle: 'Thêm mới phiếu báo giá',
      nzContent: QuotationModalComponent,
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
      if (result) {
        this.loadData();
      }
    });
  }
  openEditModal() {
    const selectedData = this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedData.length) {
      this.notification.warning('Thông báo', 'Vui lòng chọn 1 phiếu báo giá');
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: 'Chỉnh sửa phiếu báo giá',
      nzContent: QuotationModalComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        quotation: selectedData[0],
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
        this.loadData();
      }
    });
  }
  onDelete() {
    const selectedData = this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedData.length) {
      this.notification.warning('Thông báo', 'Vui lòng chọn 1 phiếu báo giá');
      return;
    }
    const confirmed = confirm('Bạn có chắc chắn muốn xóa không?')
    if (!confirmed) return;
    const quotation = new Quotation(selectedData[0]);
    quotation.IsDeleted = true;
    this.quotationService.update(quotation).subscribe({
      next: res => {
        this.loadData();
      },
      error: err => {
        this.notification.error('Lỗi', 'Thao tác thất bại');
      }
    })
  }
  applyFilter() {
    this.loadData();
  }
  resetFilter() {
    this.filter = {
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days prior
      toDate: new Date(),
      claimNo: this.claimNo.trim(),
    };
  }
}
