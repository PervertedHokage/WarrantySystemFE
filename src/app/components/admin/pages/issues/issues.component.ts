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
import { IssuesService } from '../../../../services/issues-service/issues.service';
import { IssuesFormComponent } from './issues-form/issues-form.component';

@Component({
  selector: 'app-issues',
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
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.less',
})
export class IssuesComponent implements OnInit, AfterViewInit {
  columnIssuesGroup: Column[] = [];
  gridOptionsIssuesGroup: GridOption = {};
  datasetIssuesGroup: any[] = [];

  columnIssues: Column[] = [];
  gridOptionsIssues: GridOption = {};
  datasetIssues: any[] = [];
  isCheckmode: boolean = false;
  IssuesGroupID: number = 0;

  angularGrid: any;
  dataView: any;

  angularGridIssues: any;
  dataViewIssues: any;

  IssuesGroupData: any;

  DeletedIssues: any[] = [];

  Issues: any;

  ngOnInit(): void {
    this.defineGrid();
    this.defineIssuesGrid();
    this.getIssuesGroup();
  }

  ngAfterViewInit(): void {}

  constructor(
    private notification: NzNotificationService,
    private issuesService: IssuesService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  defineGrid() {
    this.columnIssuesGroup = [
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
        name: 'Mã lỗi',
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
        id: 'Name',
        name: 'Tên lỗi hiện tượng hỏng hóc',
        field: 'Name',
        minWidth: 250,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptionsIssuesGroup = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-issuegroup-container',
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

  defineIssuesGrid() {
    this.columnIssues = [
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
      },
      {
        id: 'Code',
        name: 'Mã lỗi',
        field: 'Code',
        width: 120,
        minWidth: 90,
        maxWidth: 160,
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'Name',
        name: 'Chi tiết lỗi hiện tượng hỏng hóc',
        field: 'Name',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptionsIssues = {
      enableAutoResize: true,
      autoResize: {
        container: '.grid-issue-container',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      datasetIdPropertyName: 'Id',
    };
  }

  getIssuesGroup() {
    this.issuesService.getDataIssuesGroup().subscribe((response: any) => {
      this.datasetIssuesGroup = response?.data || [];
    });
  }

  getIssues() {
    this.issuesService.getIssues(this.IssuesGroupID).subscribe((response: any) => {
      this.datasetIssues = response?.data || [];

      if (this.angularGridIssues) {
        // Clear filters trước
        this.angularGridIssues.filterService?.clearFilters();

        // Sử dụng gridService để update dataset
        this.angularGridIssues.gridService.updateDataset(this.datasetIssues);
      }
    });
  }

  gridReady(e: any) {
    this.angularGrid = e.detail || e;
    this.dataView = this.angularGrid?.dataView;
  }

  gridIssuesReady(e: any) {
    this.angularGridIssues = e.detail?.angularGrid || e;
    this.dataViewIssues = this.angularGridIssues?.dataView;
  }

  onActiveCellChanged(e: any) {
    const args = e?.detail?.args;
    const row = args?.row;

    if (row === undefined) {
      this.IssuesGroupID = 0;
      this.IssuesGroupData = null;
      return;
    }

    const dataContext = args?.grid?.getDataItem?.(row);

    this.IssuesGroupID = dataContext?.Id ?? 0;
    this.IssuesGroupData = dataContext || null;
    this.getIssues();
  }

  onSelectedRowsChanged(e: any) {
    const args = e?.detail?.args;
    const rows = args?.rows || [];

    if (!rows.length) {
      this.IssuesGroupID = 0;
      this.IssuesGroupData = null;
      return;
    }

    const rowIndex = rows[0];
    const item = args?.grid?.getDataItem?.(rowIndex);

    this.IssuesGroupID = item?.Id ?? 0;
    this.IssuesGroupData = item || null;
  }

  onAddIssues(isEditmode: boolean): void {
    this.isCheckmode = isEditmode;
    if (this.isCheckmode == true && this.IssuesGroupID === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn 1 bản ghi để sửa!'
      );
      return;
    }
    const modalRef = this.modal.create({
      nzTitle: this.isCheckmode
        ? 'Sửa hiện tượng hỏng'
        : 'Thêm hiện tượng hỏng',
      nzContent: IssuesFormComponent,
      nzFooter: null,
      nzMaskClosable: false,
      nzKeyboard: false,
      nzData: {
        IssuesGroupID: this.IssuesGroupID,
        isEditMode: this.isCheckmode,
        dataInput: this.IssuesGroupData,
      },
    });

    modalRef.afterClose.subscribe((result) => {
      if (result === true) {
        // Reload cả master và detail
        this.getIssuesGroup();
        if (this.IssuesGroupID) {
          this.getIssues();
        }
      }
    });
  }

  onDeleteIssues() {
    if (!this.angularGrid) {
      this.notification.error(
        NOTIFICATION_TITLE.error,
        'Grid chưa được khởi tạo!'
      );
      return;
    }

    const gridService = this.angularGrid.gridService;
    const dataView = this.angularGrid.dataView;

    const selectedRowsFromSlickGrid =
      this.angularGrid?.slickGrid?.getSelectedRows?.() || [];

    let selectedItems: any[] = [];

    if (gridService && gridService.getSelectedRows) {
      const selectedRows =
        gridService.getSelectedRows() || selectedRowsFromSlickGrid;
      selectedItems = selectedRows
        .map((idx: number) => dataView.getItem(idx))
        .filter((item: any) => item);
    } else if (dataView && dataView.getSelectedIds) {
      const selectedIds = dataView.getSelectedIds();
      selectedItems = selectedIds
        .map((id: any) => dataView.getItemById(id))
        .filter((item: any) => item);
    } else if (selectedRowsFromSlickGrid.length && dataView) {
      selectedItems = selectedRowsFromSlickGrid
        .map((idx: number) => dataView.getItem(idx))
        .filter((item: any) => item);
    }

    if (selectedItems.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng chọn ít nhất 1 lỗi để xóa!'
      );
      return;
    }

    const selectedIds: number[] = [];
    const selectedCodes: string[] = [];

    selectedItems.forEach((item: any) => {
      const id = item?.Id ?? item?.ID;
      if (!id) return;

      const code =
        item?.Code ??
        item?.Name ??
        '';
      selectedIds.push(id);
      selectedCodes.push(code);
    });

    if (selectedIds.length === 0) {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Không tìm thấy lỗi hợp lệ để xóa!'
      );
      return;
    }

    const confirmMessage =
      selectedIds.length === 1
        ? `Bạn có chắc chắn muốn xóa lỗi ${selectedCodes[0]}?`
        : `Bạn có chắc chắn muốn xóa ${selectedIds.length} lỗi đã chọn?`;

    this.modal.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: confirmMessage,
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.issuesService.deleteIssues(selectedIds).subscribe({
          next: (res) => {
            if (res.status === 1) {
              this.notification.success(
                NOTIFICATION_TITLE.success,
                res.message || 'Đã xóa thành công!'
              );
              this.getIssuesGroup();
            } else {
              this.notification.warning(
                NOTIFICATION_TITLE.warning,
                res.message || 'Không thể xóa các bản ghi này!'
              );
            }
          },
          error: (err) => {
            this.notification.error(
              NOTIFICATION_TITLE.error,
              err?.error?.message || err?.message || 'Có lỗi xảy ra khi xóa!'
            );
          },
        });
      },
    });
  }
}
