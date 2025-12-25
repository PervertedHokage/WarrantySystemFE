import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
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
  TabulatorFull as Tabulator,
} from 'tabulator-tables';
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
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';
import { NOTIFICATION_TITLE } from '../../../../../../app/app.config';
import { ProductService } from '../../../../../services/products-service/product.service';

/**
 * Chi tiết linh kiện (Detail trong SparePartsGroup)
 */
interface PartDetailRow {
  Id?: number;
  SparePartNumber: string;
  Description: string;
  UnitId?: number;
  Unit?: string;
  Price?: number;
}

/**
 * Nhóm linh kiện (SparePartsGroup)
 */
interface PartGroup {
  rowID: number; // ID tạm để quản lý trong UI
  Id?: number; // ID nhóm từ DB (dùng khi update)
  Name: string; // Tên nhóm linh kiện (Group.Name)
  Details: PartDetailRow[];
  DeletedDetailIds: number[]; // Danh sách ID detail cần xóa
}

@Component({
  selector: 'app-products-form',
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
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.less',
})
export class ProductsFormComponent implements OnInit, AfterViewInit {
  @ViewChild('sparePartTable') tableRef1!: ElementRef;

  ProductID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  formGroup: FormGroup;

  sparePartData: any;
  sparePartTable: Tabulator | null = null;

  partGroups: PartGroup[] = [];
  private partRowIdCounter = 0;
  deletedSparePartGroupIds: number[] = []; // Danh sách ID nhóm cần xóa khi save
  DeletedSparePartGroup: any;


  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { ProductID: number; isEditMode: boolean; dataInput: any },
    private fb: FormBuilder,
    private modal: NzModalService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private productService: ProductService
  ) {
    if (data) {
      this.ProductID = data.ProductID || 0;
      this.isEditMode = data.isEditMode || false;
      this.dataInput = data.dataInput || null;
    }
    this.formGroup = this.fb.group({
      Name: [null, [Validators.required, Validators.maxLength(100)]],
      Code: ['', [Validators.required, Validators.maxLength(20)]],
      Description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.dataInput) {
      this.formGroup.patchValue({
        Name: this.dataInput.Name || '',
        Code: this.dataInput.Code || '',
        Description: this.dataInput.Description || ''
      });
    }
    this.loadsparePartDetailData();
  }

  ngAfterViewInit(): void {}

  close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

  loadsparePartDetailData() {
    if (!this.isEditMode || !this.ProductID) {
      this.ensurePartGroupsInitialized();
      return;
    }

    this.productService.getSparePart(this.ProductID).subscribe({
      next: (response) => {
        const sparePartData = response?.data?.asset || [];
        
        // Load vào bảng Tabulator (nếu cần)
        this.sparePartData = sparePartData.map((item: any) => ({
          Id: item.Id || 0,
          Name: item.Name || '',
        }));
        if (this.sparePartTable) {
          this.sparePartTable.setData(this.sparePartData);
        }

        // Load vào partGroups cho bảng "Linh kiện & Mô tả"
        this.loadPartGroupsFromAPI(sparePartData);
      },
      error: (err) => {
        this.notification.error(NOTIFICATION_TITLE.error, 'Lỗi khi load dữ liệu chi tiết sản phẩm!');
        console.error(err);
        // Nếu có lỗi, vẫn khởi tạo 1 dòng trống
        this.ensurePartGroupsInitialized();
      },
    });
  }

  /**
   * Load dữ liệu linh kiện từ API và convert thành PartGroup[]
   */
  private loadPartGroupsFromAPI(sparePartData: any[]): void {
    if (!sparePartData || sparePartData.length === 0) {
      this.ensurePartGroupsInitialized();
      return;
    }

    this.partRowIdCounter = 0;
    this.deletedSparePartGroupIds = [];
    const groupMap = new Map<number, PartGroup>();

    sparePartData.forEach((item: any) => {
      const groupId = item.SparePartGroupId || 0;
      const groupName = item.Name || '';
      
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, this.createNewPartGroup(groupId, groupName));
      }

      const group = groupMap.get(groupId)!;
      group.Details.push(this.mapItemToDetailRow(item));
    });

    this.partGroups = Array.from(groupMap.values());
    this.ensureEachGroupHasAtLeastOneDetail();

    if (this.partGroups.length === 0) {
      this.ensurePartGroupsInitialized();
    }
  }

  /**
   * Tạo PartGroup mới từ dữ liệu API
   */
  private createNewPartGroup(groupId: number, groupName: string): PartGroup {
    return {
      rowID: ++this.partRowIdCounter,
      Id: groupId > 0 ? groupId : undefined,
      Name: groupName,
      Details: [],
      DeletedDetailIds: [],
    };
  }

  /**
   * Map dữ liệu từ API thành PartDetailRow
   */
  private mapItemToDetailRow(item: any): PartDetailRow {
    return {
      Id: item.Id || item.ID || undefined,
      SparePartNumber: item.SparePartNumber || '',
      Description: item.Description || '',
      UnitId: item.UnitId,
      Unit: item.Unit || '',
      Price: item.Price,
    };
  }

  /**
   * Đảm bảo mỗi group có ít nhất 1 detail trống
   */
  private ensureEachGroupHasAtLeastOneDetail(): void {
    this.partGroups.forEach((group) => {
      if (!group.Details || group.Details.length === 0) {
        group.Details = [this.hydrateDetailRow()];
      }
    });
  }

  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

  // ===== Quản lý PartGroups =====

  /**
   * Tạo/khởi tạo PartDetailRow với giá trị mặc định
   */
  private hydrateDetailRow(detail?: PartDetailRow): PartDetailRow {
    return {
      Id: detail?.Id,
      SparePartNumber: detail?.SparePartNumber || '',
      Description: detail?.Description || '',
      UnitId: detail?.UnitId,
      Unit: detail?.Unit || '',
      Price: detail?.Price,
    };
  }

  /**
   * Tạo/khởi tạo PartGroup với giá trị mặc định
   */
  private hydratePartGroup(group?: PartGroup): PartGroup {
    const rowId = this.getOrCreateRowId(group?.rowID);
    const details = this.getHydratedDetails(group?.Details);

    return {
      rowID: rowId,
      Id: group?.Id,
      Name: group?.Name || '',
      Details: details,
      DeletedDetailIds: group?.DeletedDetailIds || [],
    };
  }

  /**
   * Lấy rowID hoặc tạo mới nếu chưa có
   */
  private getOrCreateRowId(existingRowId?: number): number {
    if (existingRowId && typeof existingRowId === 'number') {
      if (existingRowId > this.partRowIdCounter) {
        this.partRowIdCounter = existingRowId;
      }
      return existingRowId;
    }
    return ++this.partRowIdCounter;
  }

  /**
   * Lấy danh sách details đã được hydrate, hoặc tạo mới nếu rỗng
   */
  private getHydratedDetails(details?: PartDetailRow[]): PartDetailRow[] {
    if (details && details.length > 0) {
      return details.map((d) => this.hydrateDetailRow(d));
    }
    return [this.hydrateDetailRow()];
  }

  /**
   * Khởi tạo partGroups nếu chưa có dữ liệu
   */
  private ensurePartGroupsInitialized(): void {
    if (!this.partGroups || this.partGroups.length === 0) {
      this.partGroups = [this.hydratePartGroup()];
    }
  }

  /**
   * Tìm PartGroup theo rowID
   */
  private getPartGroupById(rowId: number): PartGroup | undefined {
    return this.partGroups.find((p) => p.rowID === rowId);
  }

  /**
   * Thêm nhóm linh kiện mới
   */
  addPartGroup(): void {
    this.partGroups = [...this.partGroups, this.hydratePartGroup()];
  }

  /**
   * Thêm dòng detail mới vào nhóm linh kiện
   */
  addDetailRow(partId: number): void {
    const partGroup = this.getPartGroupById(partId);
    if (!partGroup) return;
    partGroup.Details = [...partGroup.Details, this.hydrateDetailRow()];
  }

  /**
   * Xóa nhóm linh kiện
   */
  removePartGroup(partId: number): void {
    const partGroup = this.getPartGroupById(partId);
    if (!partGroup) return;

    // Nếu có ID từ DB, đánh dấu để xóa khi save
    if (partGroup.Id && partGroup.Id > 0) {
      this.markGroupForDeletion(partGroup.Id);
    }

    // Nếu chỉ còn 1 nhóm, chỉ clear dữ liệu thay vì xóa
    if (this.partGroups.length === 1) {
      this.clearPartGroup(partGroup);
      return;
    }

    this.partGroups = this.partGroups.filter((p) => p.rowID !== partId);
  }

  /**
   * Xóa dòng detail trong nhóm linh kiện
   */
  removeDetailRow(partId: number, detailIndex: number): void {
    const partGroup = this.getPartGroupById(partId);
    if (!partGroup || !partGroup.Details[detailIndex]) return;

    const detail = partGroup.Details[detailIndex];

    // Nếu có ID từ DB, đánh dấu để xóa khi save
    if (detail.Id && detail.Id > 0) {
      this.markDetailForDeletion(partGroup, detail.Id);
    }

    // Nếu chỉ còn 1 detail, chỉ clear dữ liệu thay vì xóa
    if (partGroup.Details.length === 1) {
      partGroup.Details[0] = this.hydrateDetailRow();
      return;
    }

    partGroup.Details.splice(detailIndex, 1);
  }

  /**
   * Đánh dấu nhóm linh kiện để xóa khi save
   */
  private markGroupForDeletion(groupId: number): void {
    if (groupId > 0 && !this.deletedSparePartGroupIds.includes(groupId)) {
      this.deletedSparePartGroupIds.push(groupId);
    }
  }

  /**
   * Đánh dấu detail để xóa khi save
   */
  private markDetailForDeletion(partGroup: PartGroup, detailId: number): void {
    if (detailId > 0 && !partGroup.DeletedDetailIds.includes(detailId)) {
      partGroup.DeletedDetailIds.push(detailId);
    }
  }

  /**
   * Clear dữ liệu của PartGroup (giữ lại structure)
   */
  private clearPartGroup(partGroup: PartGroup): void {
    this.partGroups[0] = this.hydratePartGroup({
      rowID: partGroup.rowID,
      Id: undefined,
      Name: '',
      Details: [this.hydrateDetailRow()],
      DeletedDetailIds: [],
    });
  }

  saveProductData() {
    // Validate form
    this.trimAllStringControls();
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formValue = this.formGroup.value;
    const sparePartsGroups: any[] = [];

    // Duyệt qua từng nhóm linh kiện
    for (const partGroup of this.partGroups || []) {
      // Bỏ qua nhóm không có tên
      const groupName = (partGroup.Name || '').trim();
      if (!groupName) {
        continue;
      }

      // Bỏ qua nhóm đã bị xóa (chỉ khi sửa)
      const isGroupDeleted = this.isEditMode && 
                            partGroup.Id && 
                            partGroup.Id > 0 && 
                            this.deletedSparePartGroupIds.includes(partGroup.Id);
      if (isGroupDeleted) {
        continue;
      }

      // Build danh sách SparePart cho nhóm này
      const spareParts: any[] = [];
      for (const detail of partGroup.Details || []) {
        // Bỏ qua detail trống hoàn toàn (không có gì)
        const hasSparePartNumber = detail.SparePartNumber?.trim();
        const hasDescription = detail.Description?.trim();
        const hasUnit = detail.Unit?.trim();
        const isDetailEmpty = !hasSparePartNumber && !hasDescription && !hasUnit;
        
        if (isDetailEmpty) {
          continue;
        }

        // Bỏ qua detail đã bị xóa (chỉ khi sửa)
        const isDetailDeleted = this.isEditMode && 
                               detail.Id && 
                               detail.Id > 0 && 
                               partGroup.DeletedDetailIds.includes(detail.Id);
        if (isDetailDeleted) {
          continue;
        }

        // Lấy giá trị SparePartNumber (bắt buộc phải có)
        const sparePartNumber = (detail.SparePartNumber || '').trim();
        
        // Thêm SparePart vào danh sách
        spareParts.push({
          Id: this.isEditMode && detail.Id ? detail.Id : 0,
          SparePartGroupId: this.isEditMode && partGroup.Id ? partGroup.Id : 0,
          ProductId: this.ProductID || 0,
          UnitId: detail.UnitId || 0,
          SparePartNumber: sparePartNumber,
          Description: (detail.Description || '').trim(),
          Price: detail.Price || 0,
        });
      }

      // Thêm nhóm nếu có SparePart hoặc nhóm đã tồn tại (khi sửa)
      const hasValidSpareParts = spareParts.length > 0;
      const isExistingGroup = this.isEditMode && partGroup.Id;
      
      if (hasValidSpareParts || isExistingGroup) {
        sparePartsGroups.push({
          SparePartsGroup: {
            Id: this.isEditMode && partGroup.Id ? partGroup.Id : 0,
            Name: groupName,
            ProductId: this.ProductID || 0,
          },
          SparePart: spareParts,
          DeletedSparePart: this.isEditMode ? (partGroup.DeletedDetailIds || []) : [],

        });
      }
    }

    // Tạo payload để gửi lên API
    const payload = {
      Product: {
        Id: this.isEditMode ? (this.dataInput?.Id || 0) : 0,
        Code: formValue.Code || '',
        Name: formValue.Name || '',
        Description: formValue.Description || '',
      },
      SparePartsGroups: sparePartsGroups,
      DeletedSparePartGroup: this.DeletedSparePartGroup || [], 
    };

    // Gọi API lưu dữ liệu
    this.productService.saveDataProduct(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isEditMode ? 'Sửa thành công!' : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.close(true);
        } else {
          this.notification.warning('Thông báo', res.message || 'Không thể lưu dữ liệu!');
        }
      },
      error: (err) => {
        this.notification.error('Thông báo', err.message || 'Có lỗi xảy ra khi lưu!');
        console.error(err);
      },
    });
  }
}
