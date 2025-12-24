import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
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
import { TemplateRef } from '@angular/core';
import {
  AngularSlickgridModule,
  Column,
  Filters,
  Formatters,
  GridOption,
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
import { UnitService } from '../../../../services/unit-service/unit.service';

import {
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-unit',
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
    ReactiveFormsModule
  ],
  templateUrl: './unit.component.html',
  styleUrl: './unit.component.less'
})
export class UnitComponent implements OnInit, AfterViewInit {
 columnUnit: Column[] = [];
  gridOptionUnit: GridOption = {};
  datasetUnit: any[] = [];

    angularGridIssues: any;
  dataViewIssues: any;

  UnitsID: number = 0;
  UnitsData: any = null;

  isCheckmode: boolean = false;
  formGroup: FormGroup;

  private unitModalRef: NzModalRef | null = null;


  @ViewChild('unitFormTpl', { static: true }) unitFormTpl!: TemplateRef<any>;
  ngOnInit(): void {
    this.defineGrid();
    this.getUnit();
     if (this.isCheckmode && this.UnitsData) {
      this.formGroup.patchValue({
        Name: this.UnitsData.Name || '',
        Code: this.UnitsData.Code || '',
      });
    }
  }

  ngAfterViewInit(): void {
      
  }

   constructor(
      private notification: NzNotificationService,
      private unitService: UnitService,
      private modal: NzModalService,
      private message: NzMessageService,
      private fb: FormBuilder,

    ) {
      this.formGroup = this.fb.group({
        Name: [null, [Validators.required, Validators.maxLength(50)]],
        Code: ['', [Validators.required, Validators.maxLength(50)]],
      });
    }

     defineGrid() {
    this.columnUnit = [
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
        name: 'Mã đơn vị',
        field: 'Code',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Tên đơn vị',
        field: 'Name',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptionUnit = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-unit-container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      multiSelect: false,
      rowSelectionOptions: { selectActiveRow: true },
      datasetIdPropertyName: 'Id',
      enableCellNavigation: true,
    };
  }

    getUnit() {
    this.unitService.getDataUnit().subscribe((response: any) => {
      this.datasetUnit = response?.data || [];
    });
  }

  gridUnitReady(e: any) {
    this.angularGridIssues = e.detail?.angularGrid || e;
    this.dataViewIssues = this.angularGridIssues?.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.UnitsID = 0;
      this.UnitsData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.UnitsID = dataContext?.Id ?? 0;
    this.UnitsData = dataContext || null;

    console.log('ProductDAta', this.UnitsData);
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.UnitsID = 0;
      this.UnitsData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.UnitsID = item?.Id ?? 0;
    this.UnitsData = item || null;
  }

    onAddUnit(isEditmode: boolean): void {
      this.isCheckmode = isEditmode;
      if (this.isCheckmode == true && this.UnitsID === 0) {
        this.notification.warning(
          NOTIFICATION_TITLE.warning,
          'Vui lòng chọn 1 bản ghi để sửa!'
        );
        return;
      }

      if (this.isCheckmode) {
        this.formGroup.reset({
          Name: this.UnitsData?.Name || '',
          Code: this.UnitsData?.Code || '',
        });
      } else {
        this.formGroup.reset({ Name: null, Code: '' });
      }

      const modalRef = this.modal.create({
        nzTitle: this.isCheckmode ? 'Sửa đơn vị' : 'Thêm đơn vị',
        nzContent: this.unitFormTpl,
        nzFooter: null,
        nzMaskClosable: false,
        nzKeyboard: false,

      });

      this.unitModalRef = modalRef;
  
      modalRef.afterClose.subscribe((result) => {
        this.unitModalRef = null;
        if (result === true) {
          // Reload cả master và detail
          this.getUnit();
        }
      });
    }

    onCancelUnit(event?: Event): void {
      event?.preventDefault();
      event?.stopPropagation();
      this.unitModalRef?.destroy(false);
    }
  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

     saveIssuesData() {
    this.trimAllStringControls();
    
    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const formValue = this.formGroup.value;
    if(this.isCheckmode) {
      
    }
    const payload = {
      Id: this.isCheckmode ? this.UnitsData?.Id || 0 : 0,
      Name: formValue.Name,
      Code: formValue.Code
    };

    this.unitService.saveDataUnit(payload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          const message = this.isCheckmode
            ? 'Cập nhật thành công!'
            : 'Thêm mới thành công!';
          this.notification.success('Thông báo', message);
          this.unitModalRef?.destroy(true);
          this.getUnit();
        } else {
          this.notification.warning(
            'Thông báo',
            res.message || 'Không thể lưu dữ liệu!'
          );
        }
      },
      error: (err) => {
        this.notification.error('Thông báo', 'Lỗi khi lưu dữ liệu!');
        console.error(err);
      },
    });
  }

    onDeleteProduct() {
    if (!this.UnitsID) {
      this.notification.warning(
        'Thông báo',
        'Vui lòng chọn 1 đơn vị để xóa!'
      );
      return;
    }

    const unit = this.UnitsData || {};
    const payload = {
      ...unit,
      Id: unit?.Id ?? this.UnitsID,
      IsDeleted: true,
    };

    const UnitName = this.UnitsData?.Name || 'đơn vị này';
    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: `Bạn có chắc chắn muốn xóa sản phẩm ${UnitName}?`,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.unitService.saveDataUnit(payload).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success('Thông báo', 'Đã xóa thành công!');
              this.getUnit();
            } else {
              this.notification.warning(
                'Thông báo',
                res.message || 'Không thể xóa bản ghi này!'
              );
            }
          },
          error: () => {
            this.notification.error('Thông báo', 'Có lỗi xảy ra khi xóa!');
          },
        });
      },
    });
  }
}
