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
import { QuotationExcelComponent } from './quotation-excel/quotation-excel.component';

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
    private quotationService: QuotationService,
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
  }
  loadData() {
    this.quotationService
      .getAll(
        this.filter.fromDate,
        this.filter.toDate,
        this.filter.claimNo.trim(),
      )
      .subscribe({
        next: (res) => {
          this.dataset = res.data;
        },
        error: (err) => {
          this.notification.error(
            NOTIFICATION_TITLE.error,
            'Load dữ liệu thất bại',
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
    const confirmed = confirm('Bạn có chắc chắn muốn xóa không?');
    if (!confirmed) return;
    const quotation = new Quotation(selectedData[0]);
    quotation.IsDeleted = true;
    this.quotationService.update(quotation).subscribe({
      next: (res) => {
        this.loadData();
      },
      error: (err) => {
        this.notification.error('Lỗi', 'Thao tác thất bại');
      },
    });
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
  onImportExcel() {
    const modalRef = this.modal.create({
      nzTitle: 'Nhập dữ liệu Excel',
      nzContent: QuotationExcelComponent,
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
      if (result) {
        this.loadData();
      }
    });
  }

  onExportExcel() {
    this.quotationService
      .exportExcel(
        this.filter.fromDate,
        this.filter.toDate,
        this.filter.claimNo.trim(),
      )
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Quotations_${new Date().getTime()}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.notification.success('Thông báo', 'Xuất file thành công');
        },
        error: (err) => {
          this.notification.error('Thông báo', 'Xuất file thất bại');
        },
      });
  }
}
