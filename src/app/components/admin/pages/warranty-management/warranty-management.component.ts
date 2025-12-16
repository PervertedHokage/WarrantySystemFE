import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule, NgIf } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule
} from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { HasPermissionDirective } from '../../../../directives/has-permission.directive';
import { NOTIFICATION_TITLE } from '../../../../app.config';
import { forkJoin } from 'rxjs';
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import { OrganizationService } from '../organization/organization.service';

@Component({
  selector: 'app-warranty-management',
  templateUrl: './warranty-management.component.html',
  styleUrls: ['./warranty-management.component.less'],
  imports: [
    CommonModule,
    NzModalModule,
    NzIconModule,
    NzButtonModule,
    NzTabsModule,
    NzTableModule,
    NzSelectModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzSpinModule,
    FormsModule,
    NzTreeSelectModule,
  ],
})
export class WarrantyManagementComponent implements OnInit {
  @ViewChild('tb_organization', { static: false })
    tb_organizationContainer!: ElementRef;
    tb_organization: any;
    lstOrganization: any[] = [];
    organizationForm!: FormGroup;
    isVisible = false;
    isSubmitting = false;
    searchText: string = '';
    isLoading = false;
    isEditMode = false;

    organizationId: number = 0;

    parentId:number = 0

    constructor(
      private organizationService: OrganizationService,
      private fb: FormBuilder,
      private modal: NzModalService,
      private notification: NzNotificationService
    ) {
      this.initForm();
    }
    ngAfterViewInit(): void {
      this.drawTbOrganization(this.tb_organizationContainer.nativeElement);
      this.loadOrganization();
    }
    ngOnInit() {

    }

    private initForm() {
      this.organizationForm = this.fb.group({
        Id: [0],
        OrganizationCode: ['', [Validators.required]],
        OrganizationName: ['', [Validators.required]],
        ParentId: [0],
      });
    }

    loadOrganization() {
      this.organizationService.getOrganizations().subscribe({
        next: (res: any) => {
          const data = this.organizationService.setDataTree(res.data, 'Id'); // tùy response của bạn
          this.tb_organization.setData(data);
          this.lstOrganization = this.organizationService.buildOrgTree(res.data);
        },
        error: (e) => {
          this.notification.error(NOTIFICATION_TITLE.error, e.message);
        },
      });
    }

    drawTbOrganization(container: HTMLElement) {
      if (!this.tb_organization) {
        // Khởi tạo bảng chỉ 1 lần
        this.tb_organization = new Tabulator(container, {
          dataTree: true,
          dataTreeStartExpanded: true,
          layout: 'fitDataStretch',
          locale: 'vi',
          selectableRows: 1,
          reactiveData: false, // Giúp kiểm soát thay đổi dữ liệu rõ ràng hơn
          columns: [
            {
              title: '',
              field: 'Selected',
              headerHozAlign: 'center',
              hozAlign: 'center',
              width: 70,
            },
            {
              title: 'Mã cơ cấu tổ chức',
              field: 'OrganizationCode',
              headerHozAlign: 'center',
            },
            {
              title: 'Tên cơ cấu tổ chức',
              field: 'OrganizationName',
              headerHozAlign: 'left',
            },
          ],
        });

        // Gắn event click chọn kiểu dự án
        this.tb_organization.on('rowClick', (e: any, row: any) => {
          // Bỏ chọn các dòng khác trước
          this.tb_organization.deselectRow();
          // Chọn dòng hiện tại
          row.select();
          const rowData = row.getData();
          this.organizationId = rowData.Id;
        });
      }
    }

    openAddModal() {
      this.isEditMode = false;
      let parentId= 0;
      const selectedRows = this.tb_organization.getSelectedRows();
      if (selectedRows.length == 1) {
        parentId = selectedRows[0].getData().Id
      }

      this.organizationForm.patchValue({
        Id: 0,
        OrganizationCode: '',
        OrganizationName: '',
        ParentId: parentId,
      });
      this.isVisible = true;
    }


    openEditModal() {
      const selectedRows = this.tb_organization.getSelectedRows();
      if (selectedRows.length != 1) {
        this.notification.warning(NOTIFICATION_TITLE.warning, "Vui lòng chọn 1 phòng ban cần sửa!");
        return;
      }
      this.isEditMode = true;
      const selectedDepartment = selectedRows[0].getData();

      // Reset form before setting new values
      this.organizationForm.reset();

      // Set form values with proper type conversion
      this.organizationForm.patchValue({
        Id: selectedDepartment.Id,
        OrganizationCode: selectedDepartment.OrganizationCode,
        OrganizationName: selectedDepartment.OrganizationName,
        ParentId: selectedDepartment.ParentId
      });

      console.log('Form values after patch:', this.organizationForm.value); // Debug log
      this.isVisible = true;
    }

    openDeleteModal() {
      const selectedRows = this.tb_organization.getSelectedRows();
      if (selectedRows.length === 0) {
        this.notification.warning(NOTIFICATION_TITLE.warning, 'Vui lòng chọn phòng ban cần xóa');
        return;
      }
      this.modal.confirm({
        nzTitle: 'Xác nhận xóa',
        nzContent: `Bạn có chắc chắn muốn xóa phòng ban đã chọn không?`,
        nzOkText: 'Xóa',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => {
          this.deleteOrganization();
        },
        nzCancelText: 'Hủy',
      });
    }

    deleteOrganization() {
      const selectedRows = this.tb_organization.getSelectedRows();

      // Lấy data thực tế từ row
      const deleteRequests = selectedRows
        .map((row: any) => row.getData()) // row.getData() trả về object dữ liệu
        .filter((data: any) => data.Id > 0)
        .map((data: any) => this.organizationService.deleteOrganization(data.Id));



      if (deleteRequests.length === 0) return;

      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.notification.success(NOTIFICATION_TITLE.success, 'Xóa phòng ban thành công');
          this.loadOrganization();
        },
        error: (error) => {
          this.notification.error(NOTIFICATION_TITLE.error, error.error.message);
        },
      });
    }

    onSubmit() {
      if (this.organizationForm.invalid) {
        Object.values(this.organizationForm.controls).forEach((control) => {
          if (control.invalid) {
            control.markAsTouched();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        this.notification.warning(
          NOTIFICATION_TITLE.warning,
          'Vui lòng điền đầy đủ thông tin bắt buộc'
        );
        return;
      }

      this.isSubmitting = true;
      const formData = this.organizationForm.value;

      if (this.isEditMode) {
        this.organizationService.updateOrganization(formData.Id,formData).subscribe({
          next: () => {
            this.notification.success(
              NOTIFICATION_TITLE.success,
              'Cập nhật phòng ban thành công'
            );
            this.closeModal();
            this.loadOrganization();
          },
          error: (error) => {

            this.notification.error(
              NOTIFICATION_TITLE.error,
              'Cập nhật phòng ban thất bại: ' + error.error.message
            );
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      } else {
        this.organizationService.createOrganization(formData).subscribe({
          next: () => {
            this.notification.success(NOTIFICATION_TITLE.success, 'Thêm phòng ban thành công');
            this.closeModal();
            this.loadOrganization();
          },
          error: (response) => {
            this.notification.error(
              'Lỗi',
              'Thêm phòng ban thất bại: ' + response.error.message
            );
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      }
    }

    closeModal() {
      this.isVisible = false;
      this.organizationForm.reset();
      this.isSubmitting = false;
    }

    handleCancel() {
      this.closeModal();
    }

    handleOk() {
      this.onSubmit();
    }


}
