import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Input,
  HostListener,
} from '@angular/core';
import {
  AngularSlickgridModule,
  Column,
  Filters,
  Formatters,
  GridOption,
  SliderRangeOption,
  OperatorType,
  Subscription,
} from 'angular-slickgrid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFlexModule, NzWrap } from 'ng-zorro-antd/flex';
import { NzDrawerModule, NzDrawerPlacement } from 'ng-zorro-antd/drawer';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../../../../app/app.config';
import { RegisterService } from '../../../../services/register-service/register.service';
import { RegisterFormComponent } from './register-form/register-form.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    AngularSlickgridModule,
    NzCardModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzRadioModule,
    NzSpaceModule,
    NzLayoutModule,
    NzFlexModule,
    NzDrawerModule,
    NzSplitterModule,
    NzGridModule,
    NzDatePickerModule,
    NzAutocompleteModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzInputNumberModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.less',
})
export class RegisterComponent implements OnInit, AfterViewInit {
  columnRegister: Column[] = [];
  gridOptionsRegister: GridOption = {};
  datasetRegister: any[] = [];

  columnIssues: Column[] = [];
  gridOptionsIssues: GridOption = {};
  datasetIssues: any[] = [];
  isCheckmode: boolean = false;
  UserID: number = 0;

  angularGrid: any;
  dataView: any;

  UserData: any;

  ngOnInit(): void {
    this.defineGrid();
    this.getUsers();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private modal: NzModalService,
    private message: NzMessageService,
    private registerService: RegisterService
  ) {}

  defineGrid() {
    this.columnRegister = [
      {
        id: 'stt',
        name: 'STT',
        field: 'stt',
        width: 50,
        minWidth: 50,
        maxWidth: 60,
        sortable: false,
        filterable: false,
        formatter: (row) => {
          // STT động dựa trên số thứ tự dòng (bắt đầu từ 1)
          return row !== undefined && row !== null ? (row + 1).toString() : '';
        },
        type: 'string',
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Code',
        name: 'Mã nhân viên',
        field: 'Code',
        width: 100,
        minWidth: 90,
        maxWidth: 140,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'LoginName',
        name: 'Tên đăng nhập',
        field: 'LoginName',
        minWidth: 250,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Email',
        name: 'Email',
        field: 'Email',
        minWidth: 250,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'IsAdmin',
        name: 'Vai trò',
        field: 'IsAdmin',
        minWidth: 250,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
        formatter: (_row, _cell, value) => {
          return value = true ? 'Admin' : 'Kỹ thuật viên';
        },
      },
    ];

    this.gridOptionsRegister = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-master-container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      checkboxSelector: {
        hideSelectAllCheckbox: false,
      },
      multiSelect: true,
      rowSelectionOptions: { selectActiveRow: false },
      datasetIdPropertyName: 'Id',
      enableCellNavigation: true,
    };
  }

  getUsers() {
    this.registerService.getDataUser(0).subscribe((response: any) => {
      this.datasetRegister = response?.data || [];
    });
  }

  gridReady(e: any) {
    this.angularGrid = e.detail || e;
    this.dataView = this.angularGrid?.dataView;
  }

  gridIssuesReady(e: any) {
    this.angularGrid = e.detail?.angularGrid || e;
    this.dataView = this.angularGrid?.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.UserID = 0;
      this.UserData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.UserID = dataContext?.Id ?? 0;
    this.UserData = dataContext || null;
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.UserID = 0;
      this.UserData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.UserID = item?.Id ?? 0;
    this.UserData = item || null;
  }

  onAddRegister(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.UserID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }
    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode ? 'Sửa người dùng' : 'Thêm người dùng',
      nzContent: RegisterFormComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        UserID: this.UserID,
        isEditMode: this.isCheckmode,
        dataInput: this.UserData,
      },
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        // Reload cả master và detail
        this.getUsers();
      }
    });
  }

   onDelete() {

    const payloads = {
      ID: this.UserID,
      IsDeleted: true,
    };

    if (this.UserData.length === 0) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn ít nhất một văn bản để xóa!'
      );
      return;
    }
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa không?`,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.registerService.saveData(payloads).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success('Thông báo', 'Đã xóa thành công!');
              this.getUsers();
            } else {
              this.notification.warning(
                'Thông báo',
                res.message || 'Không thể xóa bản ghi này!'
              );
            }
          },
          error: (err) => {
            this.notification.error('Thông báo', 'Có lỗi xảy ra khi xóa!');
          },
        });
      },
    });
  }

}
