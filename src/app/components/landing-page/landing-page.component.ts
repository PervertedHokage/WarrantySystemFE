import { KeyValuePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  tuiAsPortal,
  TuiPortals,
  TuiStringHandler,
  TuiStringMatcher,
} from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiDropdownService,
  TuiIcon,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TuiChevron,
  TuiComboBox,
  TuiSelect,
  TuiDataListWrapper,
  TuiFade,
  TuiTabs,
  TuiTextarea,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import {
  AngularGridInstance,
  AngularSlickgridModule,
  Column,
  DOMMouseOrTouchEvent,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
} from 'angular-slickgrid';
import { WarrantyClaim } from '../../models/warranty-claim.model';
import { LandingPageService } from '../../services/landing-page.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../app.config';
import { APIResponse } from '../../models/api-response.interface';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { TrackingModalComponent } from './tracking-modal/tracking-modal.component';
declare let grecaptcha: any;
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.less'],
  imports: [
    AngularSlickgridModule,
    FormsModule,
    KeyValuePipe,
    NzModalModule,
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDataListWrapper,
    TuiDropdown,
    TuiSelect,
    TuiFade,
    TuiIcon,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
    TuiTextarea,
    TuiChevron,
    TuiComboBox,
    TranslateModule,
    ReactiveFormsModule,
  ],
  //changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class LandingPageComponent
  extends TuiPortals
  implements OnInit, AfterViewInit
{
  private router = inject(Router);
  private _currentTab = 0;
  get currentTab() {
    return this._currentTab;
  }
  set currentTab(value: number) {
    this._currentTab = value;
    if (this._currentTab == 1) {
      this.newWarrantyClaimForm.reset();
      setTimeout(() => this.initCaptcha());
    } else {
      this.destroyCaptcha();
    }
  }
  currentFilter = 0;
  protected expanded = false;
  protected open = false;
  protected switch = false;
  protected readonly routes: any = {};
  statusMap: Record<number, { text: string; cls: string }> = {
    1: { text: 'Tiếp nhận thông tin', cls: 'status-badge status-1' },
    2: { text: 'Xác minh thông tin', cls: 'status-badge status-2' },
    3: { text: 'Chẩn đoán sơ bộ', cls: 'status-badge status-3' },
    4: { text: 'Báo giá', cls: 'status-badge status-4' },
    5: { text: 'Sửa chữa/bảo hành', cls: 'status-badge status-5' },
    6: { text: 'Hoàn trả', cls: 'status-badge status-6' },
  };
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
  dataset: WarrantyClaim[] = [];
  @ViewChild('captchaHolder')
  captchaHolder?: ElementRef<HTMLDivElement>;
  angularGrid!: AngularGridInstance;
  private widgetId?: number;
  private newWarrantyClaim = new WarrantyClaim();
  newWarrantyClaimForm: FormGroup;
  areaList = [
    { value: 1, name: 'Miền bắc' },
    { value: 2, name: 'Miền trung' },
    { value: 3, name: 'Miền nam' },
  ];
  productList = [
    'MobyData Smart Device 1',
    'MobyData Smart Device 2',
    'MobyData Smart Device Pro',
    'MobyData IoT Gateway',
    'MobyData Sensor Hub',
  ];

  issueList = [
    { value: 1, name: 'Lỗi 1' },
    { value: 2, name: 'Lỗi 2' },
    { value: 3, name: 'Lỗi 3' },
  ];

  yesNoList = [
    { value: true, name: 'Có' },
    { value: false, name: 'Không' },
  ];

  environmentList = [
    { value: 1, name: 'Môi trường bình thường' },
    { value: 2, name: 'Môi trường nóng' },
    { value: 3, name: 'Môi trường kho lạnh' },
  ];
  protected readonly areaStringify: TuiStringHandler<number> =
    this.stringifyFrom(this.areaList);
  protected readonly areaMatcher: TuiStringMatcher<number> = this.matcherFrom(
    this.areaList
  );
  protected readonly issueStringify: TuiStringHandler<number> =
    this.stringifyFrom(this.issueList);
  protected readonly issueMatcher: TuiStringMatcher<number> = this.matcherFrom(
    this.issueList
  );
  protected readonly booleanStringify: TuiStringHandler<boolean> =
    this.stringifyFrom(this.yesNoList);
  protected readonly booleanMatcher: TuiStringMatcher<number> =
    this.matcherFrom(this.yesNoList);
  protected readonly environmentStringify: TuiStringHandler<number> =
    this.stringifyFrom(this.yesNoList);
  protected readonly environmentMatcher: TuiStringMatcher<number> =
    this.matcherFrom(this.yesNoList);
  phoneNumberSearch: string = '';
  emailSearch: string = '';
  claimNoSearch: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private landingPageService: LandingPageService,
    private notification: NzNotificationService,
    private modal: NzModalService
  ) {
    super();
    this.newWarrantyClaimForm = this.formBuilder.group({
      Id: [0],
      CustomerName: [this.newWarrantyClaim.CustomerName, [Validators.required]],
      CustomerEmail: [
        this.newWarrantyClaim.CustomerEmail,
        [Validators.required],
      ],
      CustomerPhoneNumber: [
        this.newWarrantyClaim.CustomerPhoneNumber,
        [Validators.required],
      ],
      CustomerAddress: [this.newWarrantyClaim.CustomerAddress],
      ProductName: [this.newWarrantyClaim.ProductName, [Validators.required]],
      ProductId: [this.newWarrantyClaim.ProductId],
      IssueId: [this.newWarrantyClaim.IssueId, [Validators.required]],
      SerialNumber: [this.newWarrantyClaim.SerialNumber, [Validators.required]],
      HasProtection: [this.newWarrantyClaim.HasProtection],
      HasAdapter: [this.newWarrantyClaim.HasAdapter],
      HasCable: [this.newWarrantyClaim.HasCable],
      HasBattery: [this.newWarrantyClaim.HasBattery],
      HasIssueWhenOpenBox: [this.newWarrantyClaim.HasIssueWhenOpenBox],
      HasCollision: [this.newWarrantyClaim.HasCollision],
      OperationEnvironment: [this.newWarrantyClaim.OperationEnvironment],
      Status: [this.newWarrantyClaim.Status],
      Type: [this.newWarrantyClaim.Type],
      FileAddress: [this.newWarrantyClaim.FileAddress],
      Transporter: [this.newWarrantyClaim.Transporter],
      LadingNumber: [this.newWarrantyClaim.LadingNumber],
      Note: [this.newWarrantyClaim.Note],
      RecipientAddress: [this.newWarrantyClaim.RecipientAddress],
      CreatedDate: [this.newWarrantyClaim.CreatedDate],
      CreatedBy: [this.newWarrantyClaim.CreatedBy],
      UpdatedDate: [this.newWarrantyClaim.UpdatedDate],
      UpdatedBy: [this.newWarrantyClaim.UpdatedBy],
      _dummy: [null],
    });
  }
  ngOnInit(): void {
    this.currentTab = 1;
    this.prepareGrid();
  }
  ngAfterViewInit(): void {}
  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }
  prepareGrid() {
    this.columnDefinitions = [
      {
        id: 'ClaimNo',
        name: 'Mã phiếu',
        field: 'ClaimNo',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'CreatedDate',
        name: 'Ngày tạo',
        field: 'CreatedDate',
        sortable: true,
        type: 'dateUtc',
        formatter: Formatters.dateTimeIsoAmPm,
        filterable: true,
        filter: { model: Filters['compoundDate'] },
      },
      {
        id: 'CustomerName',
        name: 'Khách hàng',
        field: 'CustomerName',
        sortable: true,
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'ProductName',
        name: 'Sản phẩm',
        field: 'ProductName',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'StatusText',
        name: 'Trạng thái',
        field: 'StatusText',
        cssClass: 'cell-center',
        filterable: true,
        filter: {
          model: Filters['compoundInputText'],
        },
        formatter: (_row, _cell, value, _col, item) => {
          const s = this.statusMap[item.Status];
          return s ? `<span class="${s.cls}">${s.text}</span>` : '';
        },
      },
      {
        id: 'Tracking',
        name: 'Theo dõi',
        field: '_',
        cssClass: 'cell-center',
        sortable: false,
        filterable: false,
        excludeFromColumnPicker: true,
        formatter: (_row, _cell, _value, _colDef, dataContext) => {
          if (dataContext?.Status !== 6) {
            return '';
          }
          return `
            <button class="btn btn-sm btn-outline view-tracking-btn">
              🚛 Xem Tracking
            </button>
          `;
        },
        onCellClick: (e: Event, args: OnEventArgs) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.view-tracking-btn')) {
            return;
          }
          e.stopImmediatePropagation();
          const rowData = args.dataContext;
          const modalRef = this.modal.create({
            nzTitle: 'Lịch trình vận chuyển',
            nzContent: TrackingModalComponent,
            nzFooter: null,
            nzMaskClosable: false,
            nzKeyboard: false,
            nzData: {
              warrantyClaim: rowData
            },
          });

          modalRef.afterClose.subscribe((result) => {
            if (result === true) {

            }
          });
        },
      },
    ];

    this.gridOptions = {
      datasetIdPropertyName: 'Id',
      enableAutoResize: true,
      autoResize: {
        container: '.tab-content',
        resizeDetection: 'container',
      },
      enableSorting: true,
      enableFiltering: true,
      forceFitColumns: true,
      enableCellNavigation: true,
      rowHeight: 63,
    };
    // this.dataset = [
    //   {
    //     Id: 3,
    //     ClaimNo: 'PBH-20251218162353',
    //     CustomerName: 'Khách hàng 3',
    //     CustomerEmail: null,
    //     CustomerPhoneNumber: '0987654321',
    //     CustomerAddress: null,
    //     ProductName: 'MobyData Smart Device 2',
    //     ProductId: null,
    //     IssueId: 2,
    //     SerialNumber: 'PDA12345',
    //     HasProtection: null,
    //     HasAdapter: null,
    //     HasCable: null,
    //     HasBattery: null,
    //     HasIssueWhenOpenBox: null,
    //     HasCollision: null,
    //     OperationEnvironment: null,
    //     Status: 3,
    //     Type: null,
    //     FileAddress: null,
    //     Transporter: null,
    //     LadingNumber: null,
    //     Note: 'aw fuck off',
    //     RecipientAddress: null,
    //     CreatedDate: new Date('2025-12-18T16:23:53'),
    //     CreatedBy: 'Khách hàng 3',
    //     UpdatedDate: null,
    //     UpdatedBy: null,
    //   },
    //   {
    //     Id: 2,
    //     ClaimNo: 'PBH-20251218162320',
    //     CustomerName: 'Khách hàng 2',
    //     CustomerEmail: null,
    //     CustomerPhoneNumber: '0987654321',
    //     CustomerAddress: null,
    //     ProductName: 'MobyData Smart Device 2',
    //     ProductId: null,
    //     IssueId: 2,
    //     SerialNumber: 'PDA12345',
    //     HasProtection: null,
    //     HasAdapter: null,
    //     HasCable: null,
    //     HasBattery: null,
    //     HasIssueWhenOpenBox: null,
    //     HasCollision: null,
    //     OperationEnvironment: null,
    //     Status: 2,
    //     Type: null,
    //     FileAddress: null,
    //     Transporter: null,
    //     LadingNumber: null,
    //     Note: 'shiet',
    //     RecipientAddress: null,
    //     CreatedDate: new Date('2025-12-18T16:23:20'),
    //     CreatedBy: 'Khách hàng 2',
    //     UpdatedDate: null,
    //     UpdatedBy: null,
    //   },
    //   {
    //     Id: 1,
    //     ClaimNo: 'PBH-20251218161530',
    //     CustomerName: 'Khách hàng',
    //     CustomerEmail: null,
    //     CustomerPhoneNumber: '1234567890',
    //     CustomerAddress: null,
    //     ProductName: 'MobyData Smart Device 1',
    //     ProductId: null,
    //     IssueId: 1,
    //     SerialNumber: 'PDA12345',
    //     HasProtection: null,
    //     HasAdapter: null,
    //     HasCable: null,
    //     HasBattery: null,
    //     HasIssueWhenOpenBox: null,
    //     HasCollision: null,
    //     OperationEnvironment: null,
    //     Status: 1,
    //     Type: null,
    //     FileAddress: null,
    //     Transporter: null,
    //     LadingNumber: null,
    //     Note: 'bruh',
    //     RecipientAddress: null,
    //     CreatedDate: new Date('2025-12-18T16:15:30'),
    //     CreatedBy: 'Khách hàng',
    //     UpdatedDate: null,
    //     UpdatedBy: null,
    //   },
    // ];
  }
  loadData() {
    this.landingPageService
      .getWarrantyClaim(
        this.phoneNumberSearch,
        this.emailSearch,
        this.claimNoSearch
      )
      .subscribe({
        next: (result) => {
          this.dataset = result.data.map((d) => ({
            ...d,
            StatusText: this.getStatusText(d.Status ?? 0),
          }));
        },
      });
  }
  private async initCaptcha() {
    if (!this.captchaHolder || this.widgetId !== undefined) return;

    await this.loadScript();

    setTimeout(() => {
      this.widgetId = grecaptcha.render(this.captchaHolder?.nativeElement, {
        sitekey: '6Ldb8CssAAAAAI-kwsDqcgipSPu6AOffl8j2FaIi',
      });
    }, 50);
  }

  private destroyCaptcha() {
    if (this.widgetId !== undefined) {
      grecaptcha.reset(this.widgetId);
      this.widgetId = undefined;
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).grecaptcha) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        grecaptcha = (<any>window)['grecaptcha'];
        const check = () => {
          if (
            (window as any).grecaptcha &&
            typeof (window as any).grecaptcha.ready === 'function'
          ) {
            (window as any).grecaptcha.ready(() => resolve());
          } else {
            setTimeout(check, 25);
          }
        };
        check();
      };

      document.body.appendChild(script);
    });
  }
  protected handleToggle(): void {
    this.expanded = !this.expanded;
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected onSubmitForm() {
    if (this.newWarrantyClaimForm.invalid) {
      this.newWarrantyClaimForm.markAllAsTouched();
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng điền đầy đủ thông tin hợp lệ'
      );
      return;
    }

    const data = new WarrantyClaim(this.newWarrantyClaimForm.getRawValue());
    data.Id = 0; // just in case
    this.landingPageService.createWarrantyClaim(data).subscribe({
      next: () => {
        this.notification.success(
          NOTIFICATION_TITLE.success,
          'Đăng ký thành công'
        );
        this.newWarrantyClaimForm.reset();
      },
      error: (error: APIResponse<WarrantyClaim>) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Đăng ký thất bại: ' + error.message
        );
      },
    });
    //this.service.createWarrantyClaim(payload).subscribe();
  }
  filterStatus(status: number) {
    this.currentFilter = status;
    if (status == 0) {
      this.angularGrid.filterService.clearFilterByColumnId(
        {} as DOMMouseOrTouchEvent<HTMLDivElement>,
        'StatusText'
      );
    } else {
      const searchText = [this.statusMap[status].text];
      this.angularGrid.filterService.updateFilters([
        {
          columnId: 'StatusText',
          searchTerms: [this.statusMap[status].text],
          operator: '==',
        },
      ]);
    }
  }
  getStatusText(status: number) {
    return this.statusMap[status].text;
  }
  getStatusCount(status: number) {
    return this.dataset.filter((d) => d.Status == status).length;
  }
  private stringifyFrom<T extends IdName, K>(
    list: readonly T[]
  ): TuiStringHandler<K> {
    return (value: K) => list.find((item) => item.value === value)?.name ?? '';
  }
  private matcherFrom<T extends IdName, K>(
    list: readonly T[]
  ): TuiStringMatcher<K> {
    return (value: K, query: string) => {
      const { name } = list.find((item) => item.value === value)!;

      return (
        String(value) === query || name.toLowerCase() === query.toLowerCase()
      );
    };
  }
}

interface IdName {
  value: any;
  name: string;
}
