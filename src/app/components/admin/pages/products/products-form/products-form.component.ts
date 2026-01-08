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
  ProductID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  formGroup: FormGroup;

  sparePartData: any;
  sparePartTable: Tabulator | null = null;

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
        Id: this.dataInput.Id || 0,
        Name: this.dataInput.Name || '',
        Code: this.dataInput.Code || '',
        Description: this.dataInput.Description || '',
      });
    }
  }

  ngAfterViewInit(): void {}

  close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
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
    const payload = {
      Id: this.isEditMode ? this.dataInput?.Id : 0,
      Code: formValue.Code || '',
      Name: formValue.Name || '',
      Description: formValue.Description || ''
    };

    this.productService.saveData(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isEditMode
            ? 'Sửa thành công!'
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
          'Thông báo',
          err.message || 'Có lỗi xảy ra khi lưu!'
        );
      },
    });
  }
}
