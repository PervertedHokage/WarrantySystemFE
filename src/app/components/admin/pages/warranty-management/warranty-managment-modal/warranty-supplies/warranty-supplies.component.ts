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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NOTIFICATION_TITLE } from '../../../../../../app.config';
import { WarrantySuppliesService } from '../../../../../../services/warranty-supplies.service';
import { ProductService } from '../../../../../../services/products-service/product.service';
import { UnitService } from '../../../../../../services/unit-service/unit.service';
import { SparePart } from '../../../../../../models/spare-parts.model';

@Component({
  selector: 'warranty-supplies',
  templateUrl: './warranty-supplies.component.html',
  styleUrls: ['./warranty-supplies.component.less'],
  imports: [
    CommonModule,
    NzModalModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    FormsModule,
    NzButtonModule,
    AngularSlickgridModule,
    NzIconModule,
  ],
})
export class WarrantySuppliesComponent implements OnInit {
  @Input() claimNo: string = '';
  @Input() claimId: number = 0;

  angularGrid!: AngularGridInstance;
  gridId = `grid-warranty-supplies-${crypto.randomUUID()}`;
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];
  // Modal state
  isModalVisible = false;
  modalTitle = '';
  isEditMode = false;
  sparePartList: SparePart[] = [];
  unitList: any[] = [];

  // Form model
  formData = {
    Id: 0,
    SparePartId: null as number | null,
    SupplyCode: '',
    SupplyName: '',
    Quantity: 1,
    Unit: '',
    UnitId: null as number | null,
    UnitPrice: 0,
    Supplier: '',
    Note: '',
  };

  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private suppliesService: WarrantySuppliesService,
    private productService: ProductService,
    private unitService: UnitService,
  ) {}

  ngOnInit() {
    this.initGrid();
    this.loadSpareParts();
    this.loadUnits();
  }

  loadSpareParts() {
    this.productService.getAllSpareParts().subscribe({
      next: (res) => {
        this.sparePartList = res.data;
      },
    });
  }

  loadUnits() {
    this.unitService.getDataUnit().subscribe({
      next: (res) => {
        this.unitList = res.data;
      },
    });
  }

  onSparePartChange(sparePartId: number) {
    const part = this.sparePartList.find((p) => p.Id === sparePartId);
    if (part) {
      this.formData.SupplyCode = part.SparePartNumber || '';
      this.formData.SupplyName = part.Description || '';
      this.formData.UnitPrice = part.Price || 0;
      this.formData.UnitId = part.UnitId;
      const unit = this.unitList.find((u) => u.Id === part.UnitId);
      this.formData.Unit = unit ? unit.Name : '';
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
        id: 'SupplyCode',
        name: 'Mã vật tư',
        field: 'SupplyCode',
        sortable: true,
        filterable: true,
        minWidth: 120,
      },
      {
        id: 'SupplyName',
        name: 'Tên vật tư',
        field: 'SupplyName',
        sortable: true,
        filterable: true,
        minWidth: 200,
      },
      {
        id: 'Quantity',
        name: 'Số lượng',
        field: 'Quantity',
        sortable: true,
        filterable: true,
        minWidth: 100,
        type: 'number',
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
        container: `#grid_warranty_supplies_container`,
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
    this.suppliesService.getByClaimId(this.claimId).subscribe({
      next: (res) => {
        this.dataset = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Lỗi khi tải danh sách vật tư',
        );
      },
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.modalTitle = 'Thêm vật tư';
    this.resetForm();
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
    this.modalTitle = 'Sửa vật tư';

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
    // Validate required fields
    if (!this.formData.SparePartId || !this.formData.Quantity) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn vật tư và nhập số lượng',
      );
      return;
    }

    const payload = {
      ...this.formData,
      WarrantyClaimId: this.claimId,
    };

    if (this.isEditMode) {
      this.suppliesService.update(this.formData.Id!, payload).subscribe({
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
      this.suppliesService.create(payload).subscribe({
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
      SparePartId: null,
      SupplyCode: '',
      SupplyName: '',
      Quantity: 1,
      Unit: '',
      UnitId: null,
      UnitPrice: 0,
      Supplier: '',
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
    this.suppliesService.delete(selectedItem.Id).subscribe({
      next: () => {
        this.notification.success(NOTIFICATION_TITLE.success, 'Xóa thành công');
        this.loadData();
      },
      error: () =>
        this.notification.error(NOTIFICATION_TITLE.error, 'Xóa thất bại'),
    });
  }
}
