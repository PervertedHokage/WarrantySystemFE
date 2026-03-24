import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
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
import { QuotationNoSaveModalComponent } from './quotation-modal/quotation-modal.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { QuotationService } from '../../../../services/quotations-service/quotation.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Quotation } from '../../../../models/quotations/quotation.model';
import { QuotationDetailDTO } from '../../../../models/quotations/quotation-detail-dto.model';
import { WarrantyClaimDTO } from '../../../../models/warranty-claims/warranty-claim-dto.model';
import { WarrantyClaimManagementService } from '../../../../services/warranty-claim-management.service';

@Component({
  selector: 'quotation-no-save',
  templateUrl: './quotation-no-save.component.html',
  styleUrls: ['./quotation-no-save.component.less'],
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
export class QuotationNoSaveComponent implements OnInit, OnChanges {
  @Input() claimNo: string = '';
  @Input() warrantyClaim?: WarrantyClaimDTO;
  angularGrid!: AngularGridInstance;
  gridId = `grid-quotation-${crypto.randomUUID()}`;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: QuotationDTO[] = [];
  // Local storage for details
  public detailsMap = new Map<number, QuotationDetailDTO[]>();
  public deletedIds: number[] = [];
  private nextId = -1; // Use negative IDs for local items
  statusMap: Record<number, { text: string; cls: string }> = {
    1: { text: 'Đã gửi', cls: 'status-badge status-1' },
    2: { text: 'Chưa gửi', cls: 'status-badge status-2' },
    3: { text: 'Đã duyệt', cls: 'status-badge status-3' },
    4: { text: 'Đã từ chối', cls: 'status-badge status-4' },
    5: { text: 'Hết hạn', cls: 'status-badge status-5' },
  };
  showFilter = false;
  filter = {
    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    toDate: new Date(),
    claimNo: this.claimNo,
  };
  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private quotationService: QuotationService,
    private warrantyClaimService: WarrantyClaimManagementService,
  ) {}

  ngOnInit() {
    this.initGrid();
    console.log(this.claimNo);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['claimNo']) {
      this.filter.claimNo = this.claimNo;
      this.loadData();
    }
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
    if (!this.filter.claimNo?.trim()) {
      this.dataset = [];
      return;
    }
    if (this.dataset.length === 0 && this.nextId === -1) {
      this.quotationService
        .getAll(
          this.filter.fromDate,
          this.filter.toDate,
          this.filter.claimNo.trim(),
        )
        .subscribe({
          next: (res) => {
            this.dataset = [...res.data];
          },
          error: (err) => {
            this.notification.error(
              NOTIFICATION_TITLE.error,
              'Load dữ liệu thất bại',
            );
          },
        });
    }
  }
  openAddModal() {
    // If we have warrantyClaim input, use it directly instead of fetching
    if (this.warrantyClaim) {
      this.openAddModalWithClaim(this.warrantyClaim);
      return;
    }

    // Fallback to searching by claimNo if available
    if (this.claimNo) {
      this.warrantyClaimService
        .getWarrantyClaims(
          '',
          '',
          this.claimNo,
          this.filter.fromDate,
          this.filter.toDate,
          0,
        )
        .subscribe({
          next: (result: any) => {
            if (result.data && result.data.length > 0) {
              this.openAddModalWithClaim(result.data[0]);
            } else {
              this.notification.warning(
                'Thông báo',
                'Không tìm thấy thông tin phiếu bảo hành',
              );
            }
          },
        });
    } else {
      this.notification.warning('Thông báo', 'Thiếu số phiếu bảo hành');
    }
  }

  private openAddModalWithClaim(warrantyClaim: WarrantyClaimDTO) {
    const newQuotation = new QuotationDTO({
      WarrantyClaimId: warrantyClaim.Id,
      CustomerName: warrantyClaim.CustomerName,
      CustomerAddress: warrantyClaim.CustomerAddress,
      CustomerEmail: warrantyClaim.CustomerEmail,
      CustomerPhoneNumber: warrantyClaim.CustomerPhoneNumber,
      StatusQuotation: 2, // Chưa gửi
      StartTime: new Date(),
    });

    const modalRef = this.modal.create({
      nzTitle: 'Thêm mới báo giá (Tạm thời)',
      nzContent: QuotationNoSaveModalComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        quotation: newQuotation,
      },
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '80vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result && result.quotation) {
        const localData = result.quotation as QuotationDTO;
        const details = result.allDetails || [];

        localData.Id = this.nextId--;
        this.dataset = [localData, ...this.dataset];
        this.detailsMap.set(localData.Id, details);
        this.notification.success('Thông báo', 'Thêm thành công (tạm thời)');
      }
    });
  }
  openEditModal() {
    const selectedDataArray =
      this.angularGrid.gridService.getSelectedRowsDataItem();
    if (!selectedDataArray.length) {
      this.notification.warning('Thông báo', 'Vui lòng chọn 1 phiếu báo giá');
      return;
    }

    const selectedData = selectedDataArray[0];

    // Fetch details if not already in map
    if (!this.detailsMap.has(selectedData.Id) && selectedData.Id > 0) {
      this.quotationService.getDetailsById(selectedData.Id).subscribe({
        next: (res) => {
          this.detailsMap.set(selectedData.Id, res.data);
          this.openEditModalWithData(selectedData);
        },
      });
    } else {
      this.openEditModalWithData(selectedData);
    }
  }

  private openEditModalWithData(selectedData: QuotationDTO) {
    const modalRef = this.modal.create({
      nzTitle: 'Chỉnh sửa phiếu báo giá',
      nzContent: QuotationNoSaveModalComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        quotation: selectedData,
        details: this.detailsMap.get(selectedData.Id) || [],
      },
      nzWidth: '80vw',
      nzBodyStyle: {
        'max-height': '80vh',
        'overflow-y': 'auto',
      },
      nzCentered: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result && result.quotation) {
        const updatedQuotation = result.quotation as QuotationDTO;
        const index = this.dataset.findIndex(
          (d) => d.Id === updatedQuotation.Id,
        );
        if (index !== -1) {
          this.dataset[index] = updatedQuotation;
          this.dataset = [...this.dataset]; // Trigger change detection
          this.detailsMap.set(updatedQuotation.Id, result.allDetails || []);
          this.notification.success(
            'Thông báo',
            'Chỉnh sửa thành công (tạm thời)',
          );
        }
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

    const idToDelete = selectedData[0].Id;
    if (idToDelete > 0) {
      this.deletedIds.push(idToDelete);
    }
    this.dataset = this.dataset.filter((d) => d.Id !== idToDelete);
    this.detailsMap.delete(idToDelete);
    this.notification.success('Thông báo', 'Xóa thành công (tạm thời)');
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
