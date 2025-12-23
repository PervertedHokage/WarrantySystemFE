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
import { IssuesService } from '../issues-service/issues.service';

@Component({
  selector: 'app-issues-form',
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
  templateUrl: './issues-form.component.html',
  styleUrl: './issues-form.component.less'
})
export class IssuesFormComponent implements OnInit, AfterViewInit{
  @ViewChild('IssuesTable') tableRef1!: ElementRef;

  IssuesGroupID: number = 0;
  isEditMode: boolean = false;
  dataInput: any = null;
  formGroup: FormGroup;

  IssuesData: any[] = [];
  IssuesTable: Tabulator | null = null;

  DeletedIssues: any[] = [];


  ngOnInit(): void {
    if (this.isEditMode && this.dataInput) {
      this.formGroup.patchValue({
        Name: this.dataInput.Name || '',
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.draw_IssuesTable();
      
      if (this.isEditMode && this.IssuesGroupID) {
        this.loadIssuesDetailData();
      }
    }, 100);
  }

   constructor(
      @Inject(NZ_MODAL_DATA)
      public data: { IssuesGroupID: number; isEditMode: boolean; dataInput: any },
      private fb: FormBuilder,
      private modal: NzModalService,
      private modalRef: NzModalRef,
      private notification: NzNotificationService,
      private issuesService: IssuesService
    ) {
      if (data) {
        this.IssuesGroupID = data.IssuesGroupID || 0;
        this.isEditMode = data.isEditMode || false;
        this.dataInput = data.dataInput || null;
      }
      this.formGroup = this.fb.group({
        Name: [null, [Validators.required, Validators.maxLength(50)]],
        Code: ['', [Validators.required, Validators.maxLength(20)]],
      });
    }

  loadIssuesDetailData() {
    if (!this.IssuesGroupID) {
      return;
    }

    this.issuesService.getIssues(this.IssuesGroupID).subscribe({
      next: (response) => {
        const issues = response?.data?.asset || response?.data || [];
        
        this.IssuesData = issues.map((item: any) => ({
          Id: item.Id || 0,
          Code: item.Code || '',
          Name: item.Name || '',
        })); 

        if (this.IssuesTable) {
          this.IssuesTable.setData(this.IssuesData);
        }
      },
      error: (err) => {
        this.notification.error(NOTIFICATION_TITLE.error, 'Lỗi khi load dữ liệu chi tiết lỗi!');
        console.error(err);
      },
    });
  }

  private trimAllStringControls() {
    Object.keys(this.formGroup.controls).forEach((k) => {
      const c = this.formGroup.get(k);
      const v = c?.value;
      if (typeof v === 'string') c!.setValue(v.trim(), { emitEvent: false });
    });
  }

  // Lưu cả master và detail
  saveIssuesData() {
    this.trimAllStringControls();
    
    // Validate form master
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.notification.warning('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const tableData = this.IssuesTable?.getData() || [];
    
    if (tableData.length === 0) {
      this.notification.warning('Thông báo', 'Vui lòng thêm ít nhất 1 chi tiết lỗi!');
      return;
    }

    const invalidRows = tableData.filter((row: any) => !row.Name || row.Name.trim() === '');
    if (invalidRows.length > 0) {
      this.notification.warning('Thông báo', 'Vui lòng nhập tên cho tất cả chi tiết lỗi!');
      return;
    }

    const formValue = this.formGroup.value;
    if(this.isEditMode) {
      
    }
    const payload = {
      IssuesGroup: {
      Id: this.isEditMode ? this.dataInput?.Id || 0 : 0,
      Name: formValue.Name,
      Code: formValue.Code
      },
 
      Issues: tableData.map((item: any, index: number) => ({
        Id: this.isEditMode ? item.Id  : 0,
        Code: item.Code || '',
        Name: item.Name || '',
      })),
      
      DeletedIssues: this.DeletedIssues,

    };

    this.issuesService.saveDataIssuesGroup(payload).subscribe({
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
        console.error(err);
      },
    });
  }

   close(reload: boolean = false) {
    this.modalRef.close(reload);
  }

    draw_IssuesTable() {
    if (this.IssuesTable) {
      this.IssuesTable.replaceData(this.IssuesData);
    } else {
      this.IssuesTable = new Tabulator(this.tableRef1.nativeElement, {
        data: this.IssuesData,
        layout: 'fitDataStretch',
        height: '100%',
        placeholder: 'Không có dữ liệu',
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        selectableRows: 1,
        columns: [
          {
            title: '',
            field: 'addRow',
            hozAlign: 'center',
            width: 40,
            headerSort: false,
            titleFormatter: () =>
              `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                <span class="add-icon" style="color: #52c41a; cursor: pointer; font-size: 18px; font-weight: bold;" title="Thêm dòng">+</span>
              </div>`,
            headerClick: () => {
              this.addRow();
            },
            formatter: () =>
              `<span class="delete-icon" style="color: #ff4d4f; cursor: pointer; font-size: 16px; font-weight: bold;" title="Xóa dòng">×</span>`,
            cellClick: (e, cell) => {
              if ((e.target as HTMLElement).classList.contains('delete-icon')) {
                this.modal.confirm({
                  nzTitle: 'Xác nhận xóa',
                  nzContent: 'Bạn có chắc chắn muốn xóa không?',
                  nzOkText: 'Đồng ý',
                  nzCancelText: 'Hủy',
                  nzOnOk: () => {
                    const row = cell.getRow();
                    const rowData = row.getData();
                    const rowIndex = this.IssuesData.indexOf(rowData);
                    if (rowData['Id']) {
                      this.DeletedIssues.push(rowData['Id']);
                    }
                    row.delete();
                    this.IssuesData =
                      this.IssuesData.filter((x) => x !== rowData);
                  },
                });
              }
            },
          },
          {
            title: 'STT',
            hozAlign: 'center',
            formatter: 'rownum',
            headerHozAlign: 'center',
            field: 'STT',
          },
         
          {
            title: 'Mã lỗi',
            field: 'Code',
            headerHozAlign: 'center',
            editor: 'input',
          },
          {
            title: 'Tên chi tiết lỗi',
            field: 'Name',
            headerHozAlign: 'center',
            editor: 'textarea',
          },
        ],
      });
    }
  }
  addRow() {
    if (this.IssuesTable) {
      this.IssuesTable.addRow({
        Code: '',
        Name: '',
      });
    }
  }

}
