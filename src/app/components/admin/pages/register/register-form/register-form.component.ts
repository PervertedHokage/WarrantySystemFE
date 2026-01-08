import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  DestroyRef,
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
  EnvironmentInjector,
  ApplicationRef,
  Type,
  createComponent,
  OnDestroy,
} from '@angular/core';
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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';
import { NOTIFICATION_TITLE } from '../../../../../../app/app.config';
import { ProductService } from '../../../../../services/products-service/product.service';
import { SelectControlComponent } from '../../select-control/select-control.component';
import { RegisterService } from '../../../../../services/register-service/register.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSliderModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzSplitterModule,
    NzCheckboxModule,
    NzSelectModule,
    NzTabsModule,
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.less',
})
export class RegisterFormComponent implements OnInit, AfterViewInit {
  formGroup: FormGroup;
  UserID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  passwordVisible: boolean = false;

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {}

  constructor(
    @Inject(NZ_MODAL_DATA)
    public data: { UserID: number; isEditMode: boolean; dataInput: any },
    private fb: FormBuilder,
    private modal: NzModalService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private registerService: RegisterService
  ) {
    if (data) {
      this.UserID = data.UserID || 0;
      this.isEditMode = data.isEditMode || false;
      this.dataInput = data.dataInput || null;
    }
    this.formGroup = this.fb.group({
      FullName: [null, [Validators.required, Validators.maxLength(50)]],
      Code: ['', [Validators.required, Validators.maxLength(20)]],
      Email: [
        null,
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      Telephone: [
        null,
        [
          Validators.required,
          Validators.pattern(/^0\d{9,10}$/),
          Validators.minLength(10),
          Validators.maxLength(11),
        ],
      ],
      LoginName: [null, [Validators.required, Validators.maxLength(50)]],
      PasswordHash: [null, [Validators.required, Validators.maxLength(50)]],
      IsAdmin: [false],
    });

    // Initialize form with data if editing
    if (this.isEditMode && this.dataInput) {
      this.formGroup.patchValue({
        Id: this.dataInput.Id,
        FullName: this.dataInput.FullName,
        Code: this.dataInput.Code,
        Email: this.dataInput.Email,
        Telephone: this.dataInput.Telephone,
        LoginName: this.dataInput.LoginName,
        PasswordHash: "1" ,
        IsAdmin: this.dataInput.IsAdmin,
      });
    }
  }

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

  saveData() {
    this.trimAllStringControls();

    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const formValue = this.formGroup.value;

    const payload = {
      Id: this.isEditMode ? this.dataInput?.Id || 0 : 0,
      Code: formValue.Code,
      FullName: formValue.FullName,
      Email: formValue.Email,
      LoginName: formValue.LoginName,
      PasswordHash: formValue.PasswordHash,
      Telephone: formValue.Telephone,
      IsAdmin: formValue.IsAdmin
    };

    this.registerService.saveData(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isEditMode
            ? 'Cập nhật thành công!'
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
        this.notification.error('Thông báo', 'Lỗi khi lưu dữ liệu!');
      },
    });
  }
}
