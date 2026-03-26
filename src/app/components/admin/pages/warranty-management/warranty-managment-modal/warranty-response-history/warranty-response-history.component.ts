import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  Input,
  SimpleChanges,
} from '@angular/core';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule, NgIf } from '@angular/common';
import {
  AngularGridInstance,
  Column,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
} from 'angular-slickgrid';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NOTIFICATION_TITLE } from '../../../../../../app.config';
import { ResponseHistoryService } from '../../../../../../services/response-history.service';
import { CustomerService } from '../../../../../../services/customer-service/customer.service';
import { UserManagementService } from '../../../../../../services/user-service/user-management.service';
import { Customer } from '../../../../../../models/customer.model';
import { IUser } from '../../../../../../models/user.interface';

@Component({
  selector: 'warranty-response-history',
  templateUrl: './warranty-response-history.component.html',
  styleUrls: ['./warranty-response-history.component.less'],
  imports: [
    CommonModule,
    NzModalModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    FormsModule,
    NzButtonModule,
    AngularSlickgridModule,
    NzIconModule,
  ],
})
export class WarrantyResponseHistoryComponent implements OnInit {
  @Input() claimNo: string = '';
  @Input() claimId: number = 0;
  @Input() isNoSave: boolean = false;

  angularGrid!: AngularGridInstance;
  deletedIds: number[] = [];
  tempIdCounter: number = -1;
  gridId = `grid-warranty-response-history-${crypto.randomUUID()}`;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  showFilter = false;

  filter = {
    fromDate: null,
    toDate: null,
  };

  // Modal state
  isModalVisible = false;
  modalTitle = '';
  isEditMode = false;
  customerList: Customer[] = [];
  userList: IUser[] = [];

  // Form model
  formData = {
    Id: 0,
    ResponseDate: null as Date | null,
    CustomerId: null as number | null,
    CustomerName: '',
    ResponseContent: '',
    ReceptionWorkerId: null as number | null,
    HandledBy: '',
    Status: 1,
    Note: '',
  };

  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    public responseHistoryService: ResponseHistoryService,
    private customerService: CustomerService,
    private userService: UserManagementService,
  ) {}

  ngOnInit() {
    this.initGrid();
    this.loadCustomers();
    this.loadUsers();
  }

  loadCustomers() {
    this.customerService.getDataCustomers().subscribe({
      next: (res) => {
        this.customerList = res.data;
      },
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.userList = res.data;
      },
    });
  }

  onCustomerChange(customerId: number) {
    const customer = this.customerList.find((c) => c.Id === customerId);
    if (customer) {
      this.formData.CustomerName = customer.CustomerName || '';
    }
  }

  onUserChange(userId: number) {
    const user = this.userList.find((u) => u.Id === userId);
    if (user) {
      this.formData.HandledBy = user.FullName || '';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['claimNo'] || changes['claimId']) && this.claimId) {
      this.loadData();
    }
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }

  initGrid() {
    this.columnDefinitions = [
      {
        id: 'ResponseDate',
        name: 'Ngày phản hồi',
        field: 'ResponseDate',
        sortable: true,
        filterable: true,
        minWidth: 120,
        type: 'dateIso',
        formatter: Formatters.dateIso,
      },
      {
        id: 'CustomerName',
        name: 'Khách hàng',
        field: 'CustomerName',
        sortable: true,
        filterable: true,
        minWidth: 150,
      },
      {
        id: 'ResponseContent',
        name: 'Nội dung phản hồi',
        field: 'ResponseContent',
        sortable: true,
        filterable: true,
        minWidth: 300,
      },
      {
        id: 'HandledBy',
        name: 'Người xử lý',
        field: 'HandledBy',
        sortable: true,
        filterable: true,
        minWidth: 120,
      },
      {
        id: 'Status',
        name: 'Trạng thái',
        field: 'Status',
        sortable: true,
        filterable: true,
        minWidth: 100,
        formatter: (_row, _cell, value, _col, item) => {
          const statusMap: Record<number, { text: string; color: string }> = {
            1: { text: 'Chờ xử lý', color: '#faad14' },
            2: { text: 'Đang xử lý', color: '#1890ff' },
            3: { text: 'Đã giải quyết', color: '#52c41a' },
            4: { text: 'Đã đóng', color: '#8c8c8c' },
          };
          const status = statusMap[value] || { text: value, color: '#000' };
          return `<span style="color: ${status.color}; font-weight: 600;">${status.text}</span>`;
        },
      },
      {
        id: 'Note',
        name: 'Ghi chú',
        field: 'Note',
        sortable: true,
        filterable: true,
        minWidth: 200,
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      autoResize: {
        container: `#grid_warranty_response_history_container`,
        resizeDetection: 'container',
      },
      enableCellNavigation: true,
      enableFiltering: true,
      enableSorting: true,
      enablePagination: false,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
      rowHeight: 40,
      datasetIdPropertyName: 'Id', // Use 'Id' instead of default 'id'
    };
  }

  loadData() {
    if (!this.claimId) return;
    this.responseHistoryService.getByClaimId(this.claimId).subscribe({
      next: (res) => {
        this.dataset = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Lỗi khi tải lịch sử phản hồi',
        );
      },
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.modalTitle = 'Thêm phản hồi';
    this.resetForm();
    this.formData.ResponseDate = new Date(); // Default to today
    this.isModalVisible = true;
  }

  openEditModal() {
    const selectedItems =
      this.angularGrid?.gridService?.getSelectedRowsDataItem();
    if (!selectedItems || selectedItems.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn một dòng để sửa',
      );
      return;
    }

    this.isEditMode = true;
    this.modalTitle = 'Sửa phản hồi';

    // Get selected item data
    const selectedItem: any = selectedItems[0];
    this.formData = { ...selectedItem };
    this.isModalVisible = true;
  }

  handleModalCancel() {
    this.isModalVisible = false;
    this.resetForm();
  }

  handleModalOk() {
    if (
      !this.formData.ResponseDate ||
      !this.formData.CustomerId ||
      !this.formData.ResponseContent
    ) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng điền đầy đủ thông tin bắt buộc',
      );
      return;
    }

    const payload = {
      ...this.formData,
      WarrantyClaimId: this.claimId,
    };

    if (this.isNoSave) {
      if (this.isEditMode) {
        const index = this.dataset.findIndex((x) => x.Id === this.formData.Id);
        if (index !== -1) {
          this.dataset[index] = { ...payload };
          this.dataset = [...this.dataset];
        }
      } else {
        const newId = this.tempIdCounter--;
        const newItem = { ...payload, Id: newId };
        this.dataset = [newItem, ...this.dataset];
      }
      this.isModalVisible = false;
      this.resetForm();
      return;
    }

    if (this.isEditMode) {
      this.responseHistoryService.update(this.formData.Id!, payload).subscribe({
        next: () => {
          this.notification.success(
            NOTIFICATION_TITLE.success,
            'Cập nhật thành công',
          );
          this.loadData();
          this.isModalVisible = false;
        },
        error: () =>
          this.notification.error(
            NOTIFICATION_TITLE.error,
            'Cập nhật thất bại',
          ),
      });
    } else {
      this.responseHistoryService.create(payload).subscribe({
        next: () => {
          this.notification.success(
            NOTIFICATION_TITLE.success,
            'Thêm mới thành công',
          );
          this.loadData();
          this.isModalVisible = false;
        },
        error: () =>
          this.notification.error(
            NOTIFICATION_TITLE.error,
            'Thêm mới thất bại',
          ),
      });
    }
  }

  resetForm() {
    this.formData = {
      Id: 0,
      ResponseDate: null,
      CustomerId: null,
      CustomerName: '',
      ResponseContent: '',
      ReceptionWorkerId: null,
      HandledBy: '',
      Status: 1,
      Note: '',
    };
  }

  onDelete() {
    const selectedRows = this.angularGrid?.gridService?.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn một dòng để xóa',
      );
      return;
    }

    const confirmed = confirm('Bạn có chắc chắn muốn xóa?');
    if (!confirmed) return;

    const selectedItem =
      this.angularGrid.gridService.getSelectedRowsDataItem()[0];

    if (this.isNoSave) {
      if (selectedItem.Id > 0) {
        this.deletedIds.push(selectedItem.Id);
      }
      this.dataset = this.dataset.filter((x) => x.Id !== selectedItem.Id);
      return;
    }

    this.responseHistoryService.delete(selectedItem.Id).subscribe({
      next: () => {
        this.notification.success(NOTIFICATION_TITLE.success, 'Xóa thành công');
        this.loadData();
      },
      error: () =>
        this.notification.error(NOTIFICATION_TITLE.error, 'Xóa thất bại'),
    });
  }

  applyFilter() {
    // TODO: Implement filter logic
    this.loadData();
  }

  resetFilter() {
    this.filter = {
      fromDate: null,
      toDate: null,
    };
    this.loadData();
  }

  getAddedItems() {
    return this.dataset.filter((x) => x.Id < 0);
  }

  getUpdatedItems() {
    return this.dataset.filter((x) => x.Id > 0);
  }

  getDeletedIds() {
    return this.deletedIds;
  }
}
