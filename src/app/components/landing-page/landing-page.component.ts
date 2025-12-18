import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
  AngularSlickgridModule,
  Column,
  Filters,
  Formatters,
  GridOption,
} from 'angular-slickgrid';
import { WarrantyClaim } from '../../models/warranty-claim.model';
import { LandingPageService } from '../../services/landing-page.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../app.config';
import { APIResponse } from '../../models/api-response.interface';
declare let grecaptcha: any;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class LandingPageComponent extends TuiPortals implements OnInit {
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
    } else this.destroyCaptcha();
  }
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
  @ViewChild('captchaHolder')
  captchaHolder?: ElementRef<HTMLDivElement>;
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

  constructor(
    private formBuilder: FormBuilder,
    private landingPageService: LandingPageService,
    private notification: NzNotificationService
  ) {
    super();
    this.newWarrantyClaimForm = this.formBuilder.group({
      Id: [0],
      CustomerName: [this.newWarrantyClaim.CustomerName, [Validators.required]],
      CustomerEmail: [this.newWarrantyClaim.CustomerEmail],
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
    this.prepareGrid();
  }
  ngOnInit(): void {
    this.currentTab = 1;
  }
  prepareGrid() {
    this.columnDefinitions = [
      {
        id: 'requestCode',
        name: 'Mã yêu cầu',
        field: 'requestCode',
        sortable: true,
        type: 'string',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'createdDate',
        name: 'Ngày tạo',
        field: 'createdDate',
        sortable: true,
        type: 'dateUtc',
        formatter: Formatters.dateTimeIsoAmPm,
        filterable: true,
        filter: { model: Filters['compoundDate'] },
      },
      {
        id: 'customer',
        name: 'Khách hàng',
        field: 'customer',
        sortable: true,
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'product',
        name: 'Sản phẩm',
        field: 'product',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
      {
        id: 'status',
        name: 'Trạng thái',
        field: 'status',
        filterable: true,
        filter: { model: Filters['compoundInputText'] },
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      autoResize: {
        container: '.tab-content',
        resizeDetection: 'container',
      },
      enableFiltering: true,
      enableSorting: true,
      forceFitColumns: true,
      enableAutoResizeColumnsByCellContent: false,
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
