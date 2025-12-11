import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiDropdownService,
  TuiIcon,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiFade, TuiTabs } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { AngularSlickgridModule, Column, GridOption } from 'angular-slickgrid';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.less'],
  imports: [
    AngularSlickgridModule,
    FormsModule,
    KeyValuePipe,
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiFade,
    TuiIcon,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class LandingPageComponent extends TuiPortals {
  private router = inject(Router);
  currentTab = 1;
  protected expanded = false;
  protected open = false;
  protected switch = false;
  protected readonly routes: any = {};

  protected readonly drawer = {
    Components: [{ name: 'Thu gọn', icon: '@tui.chevron-left', tabIndex: 0 }],
    Essentials: [
      { name: 'Đăng ký bảo hành', icon: '@tui.newspaper', tabIndex: 1 },
      { name: 'Lịch sử bảo hành', icon: '@tui.history', tabIndex: 2 },
      { name: 'Liên hệ', icon: '@tui.contact', tabIndex: 3 },
    ],
  };
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];

  constructor() {
    super();
    this.prepareGrid();
  }

  prepareGrid() {
    this.columnDefinitions = [
      {
        id: 'requestCode',
        name: 'Mã yêu cầu',
        field: 'requestCode',
        sortable: true,
        type: 'string',
        width: 200,
      },
      {
        id: 'createdDate',
        name: 'Ngày tạo',
        field: 'createdDate',
        sortable: true,
        width: 200,
      },
      {
        id: 'customer',
        name: 'Khách hàng',
        field: 'customer',
        sortable: true,
        width: 200,
      },
      { id: 'product', name: 'Sản phẩm', field: 'product', width: 200 },
      { id: 'status', name: 'Trạng thái', field: 'status', width: 200 },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      enableFiltering: true,
      enableSorting: true,
      enableGridMenu: true,
      gridMenu: {
        commandTitle: 'Custom Commands',
        columnTitle: 'Columns',
        iconCssClass: 'fa fa-ellipsis-v',
        menuWidth: 17,
        resizeOnShowHeaderRow: true,
        commandItems: [
          {
            iconCssClass: 'fa fa-filter text-danger',
            title: 'Clear All Filters',
            disabled: false,
            command: 'clear-filter',
          },
          {
            iconCssClass: 'fa fa-random',
            title: 'Toggle Filter Row',
            disabled: false,
            command: 'toggle-filter',
          },
          // you can add sub-menus by adding nested `commandItems`
          {
            // we can also have multiple nested sub-menus
            command: 'export',
            title: 'Exports',
            positionOrder: 99,
            commandItems: [
              { command: 'exports-txt', title: 'Text (tab delimited)' },
              {
                command: 'sub-menu',
                title: 'Excel',
                cssClass: 'green',
                subMenuTitle: 'available formats',
                subMenuTitleCssClass: 'text-italic orange',
                commandItems: [
                  { command: 'exports-csv', title: 'Excel (csv)' },
                  { command: 'exports-xlsx', title: 'Excel (xlsx)' },
                ],
              },
            ],
          },
        ],
        onCommand: (e, args) => {
          if (args.command === 'toggle-filter') {
            // this.gridOptions.setHeaderRowVisibility(
            //   !this.gridOptions.getOptions().showHeaderRow
            // );
          } else if (args.command === 'clear-filter') {
            // this.gridOptions.clearFilters();
            // this.gridOptions.refresh();
          }
        },
      },
    };

    // fill the dataset with your data (or read it from the DB)
    this.dataset = [
      {
        id: 'MD-7800',
        requestCode: 'MD-7800',
        createdDate: '2025-12-06',
        customer: 'Hoàng Văn E',
        product: 'MobyData Sensor Hub',
        status: 1,
      },
      {
        id: 'MD-6844',
        requestCode: 'MD-6844',
        createdDate: '2025-11-19',
        customer: 'Hoàng Văn E',
        product: 'MobyData Smart Device 1',
        status: 1,
      },
      {
        id: 'MD-7506',
        requestCode: 'MD-7506',
        createdDate: '2025-11-30',
        customer: 'Trần Thị B',
        product: 'MobyData IoT Gateway',
        status: 1,
      },
      {
        id: 'MD-1931',
        requestCode: 'MD-1931',
        createdDate: '2025-12-05',
        customer: 'Phạm Thị D',
        product: 'MobyData IoT Gateway',
        status: 1,
      },
      {
        id: 'MD-4262',
        requestCode: 'MD-4262',
        createdDate: '2025-11-19',
        customer: 'Nguyễn Văn A',
        product: 'MobyData IoT Gateway',
        status: 1,
      },

      // 20 more
      {
        id: 'MD-8201',
        requestCode: 'MD-8201',
        createdDate: '2025-12-02',
        customer: 'Lê Quốc H',
        product: 'MobyData Sensor Hub',
        status: 2,
      },
      {
        id: 'MD-5520',
        requestCode: 'MD-5520',
        createdDate: '2025-12-04',
        customer: 'Trần Văn T',
        product: 'MobyData Smart Device 1',
        status: 3,
      },
      {
        id: 'MD-6612',
        requestCode: 'MD-6612',
        createdDate: '2025-11-28',
        customer: 'Đỗ Minh K',
        product: 'MobyData IoT Gateway',
        status: 1,
      },
      {
        id: 'MD-9981',
        requestCode: 'MD-9981',
        createdDate: '2025-12-01',
        customer: 'Phạm Mỹ N',
        product: 'MobyData Sensor Hub',
        status: 4,
      },
      {
        id: 'MD-4410',
        requestCode: 'MD-4410',
        createdDate: '2025-11-15',
        customer: 'Ngô Tấn P',
        product: 'MobyData Smart Device 1',
        status: 2,
      },
      {
        id: 'MD-7322',
        requestCode: 'MD-7322',
        createdDate: '2025-11-25',
        customer: 'Hoàng Anh Q',
        product: 'MobyData IoT Gateway',
        status: 3,
      },
      {
        id: 'MD-8840',
        requestCode: 'MD-8840',
        createdDate: '2025-12-03',
        customer: 'Võ Trúc L',
        product: 'MobyData Sensor Hub',
        status: 2,
      },
      {
        id: 'MD-2201',
        requestCode: 'MD-2201',
        createdDate: '2025-11-10',
        customer: 'Bùi Gia M',
        product: 'MobyData Smart Device 1',
        status: 1,
      },
      {
        id: 'MD-9903',
        requestCode: 'MD-9903',
        createdDate: '2025-12-07',
        customer: 'Huỳnh Nhật C',
        product: 'MobyData IoT Gateway',
        status: 4,
      },
      {
        id: 'MD-7744',
        requestCode: 'MD-7744',
        createdDate: '2025-11-21',
        customer: 'Trịnh Văn U',
        product: 'MobyData Smart Device 1',
        status: 2,
      },
      {
        id: 'MD-2332',
        requestCode: 'MD-2332',
        createdDate: '2025-11-18',
        customer: 'Dương Thị H',
        product: 'MobyData Sensor Hub',
        status: 3,
      },
      {
        id: 'MD-5129',
        requestCode: 'MD-5129',
        createdDate: '2025-12-05',
        customer: 'Lý Thanh V',
        product: 'MobyData IoT Gateway',
        status: 4,
      },
      {
        id: 'MD-6600',
        requestCode: 'MD-6600',
        createdDate: '2025-11-29',
        customer: 'Phan Gia B',
        product: 'MobyData Smart Device 1',
        status: 2,
      },
      {
        id: 'MD-3891',
        requestCode: 'MD-3891',
        createdDate: '2025-12-06',
        customer: 'Tạ Minh D',
        product: 'MobyData Sensor Hub',
        status: 1,
      },
      {
        id: 'MD-2718',
        requestCode: 'MD-2718',
        createdDate: '2025-11-27',
        customer: 'Nguyễn Ngọc F',
        product: 'MobyData IoT Gateway',
        status: 4,
      },
      {
        id: 'MD-6644',
        requestCode: 'MD-6644',
        createdDate: '2025-11-26',
        customer: 'Hoàng Trọng Y',
        product: 'MobyData Smart Device 1',
        status: 3,
      },
      {
        id: 'MD-5568',
        requestCode: 'MD-5568',
        createdDate: '2025-12-03',
        customer: 'Mai Thị Z',
        product: 'MobyData IoT Gateway',
        status: 2,
      },
      {
        id: 'MD-8123',
        requestCode: 'MD-8123',
        createdDate: '2025-11-14',
        customer: 'Trương Quốc O',
        product: 'MobyData Sensor Hub',
        status: 3,
      },
      {
        id: 'MD-9400',
        requestCode: 'MD-9400',
        createdDate: '2025-11-30',
        customer: 'Đặng Thái J',
        product: 'MobyData Smart Device 1',
        status: 1,
      },
    ];
  }
  protected handleToggle(): void {
    this.expanded = !this.expanded;
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
