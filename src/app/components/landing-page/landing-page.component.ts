import { CommonModule, KeyValuePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  TuiIdentityMatcher,
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
  TuiFilterByInputPipe,
  TuiCheckbox,
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
import { WarrantyClaim } from '../../models/warranty-claims/warranty-claim.model';
import { LandingPageService } from '../../services/landing-page.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../app.config';
import { APIResponse } from '../../models/api-response.interface';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { TrackingModalComponent } from './tracking-modal/tracking-modal.component';
import { TaigaDropdownData } from '../../models/taiga-dropdown-data';
import { IssueFullDTO } from '../../models/issue-full-DTO.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/products-service/product.service';
import { IssuesService } from '../../services/issues-service/issues.service';
import { WarrantyClaimDTO } from '../../models/warranty-claims/warranty-claim-dto.model';
import { AuthService } from '../../auth/auth.service';
import { IUser } from '../../models/user.interface';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CheckStatusBySerialResult } from '../../models/serial-check-result.model';
declare let grecaptcha: any;
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.less'],
  imports: [
    AngularSlickgridModule,
    CommonModule,
    FormsModule,
    KeyValuePipe,
    NzModalModule,
    TuiAppearance,
    TuiButton,
    TuiCheckbox,
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
    TuiDataListWrapper,
    TuiFilterByInputPipe,
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
  //#region Properties
  private router = inject(Router);
  private _currentTab = 0;
  private _currentSection = 0;
  get currentTab() {
    return this._currentTab;
  }
  set currentTab(value: number) {
    this._currentTab = value;
    if (this._currentTab == 0) return;
    if (this._currentTab == 1 && this._currentSection == 3) {
      this.newWarrantyClaimForm.reset();
      this.loadProducts();
      this.loadIssues();
      setTimeout(() => this.initCaptcha());
    } else {
      this.destroyCaptcha();
    }
  }
  get currentSection() {
    return this._currentSection;
  }
  set currentSection(value: number) {
    this._currentSection = value;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this._currentSection == 1) {
      this.destroyCaptcha();
    }
    if (this._currentSection == 2) {
      this.destroyCaptcha();
    }
    if (this._currentSection == 3) {
      this.newWarrantyClaimForm.reset();
      this.loadProducts();
      this.loadIssues();
      setTimeout(() => this.initCaptcha());
    }
  }
  currentFilter = 0;
  pdfUrl: SafeResourceUrl;
  serialValue: string = '';
  statusData: CheckStatusBySerialResult | null = null;
  hasAgreed = false;
  protected expanded = false;
  protected open = false;
  title: string = 'Tạo yêu cầu bảo hành';
  subTitle: string = 'Vui lòng điền đầy đủ thông tin để gửi yêu cầu bảo hành';
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
  dataset: WarrantyClaimDTO[] = [];
  angularGrid!: AngularGridInstance;
  @ViewChild('captchaHolder')
  captchaHolder?: ElementRef<HTMLDivElement>;
  private widgetId?: number;

  newWarrantyClaimForm: FormGroup;
  areaList: TaigaDropdownData[] = [
    { Value: 1, Name: 'Miền bắc' },
    { Value: 2, Name: 'Miền trung' },
    { Value: 3, Name: 'Miền nam' },
  ];
  productList: Product[] = [];
  selectedProduct: Product | null = null;
  issueList: IssueFullDTO[] = [];

  yesNoList: TaigaDropdownData[] = [
    { Value: true, Name: 'Có' },
    { Value: false, Name: 'Không' },
  ];

  environmentList: TaigaDropdownData[] = [
    { Value: 1, Name: 'Môi trường bình thường' },
    { Value: 2, Name: 'Môi trường nóng' },
    { Value: 3, Name: 'Môi trường kho lạnh' },
  ];
  protected taigaDropdownStringify: TuiStringHandler<TaigaDropdownData> =
    this.stringifyFrom('Name');
  protected taigaDropdownMatcher: TuiIdentityMatcher<TaigaDropdownData> =
    this.idMatcherFrom('Value');
  protected productStringify: TuiStringHandler<Product> =
    this.stringifyFrom('Name');
  protected productIdentity: TuiIdentityMatcher<Product> =
    this.idMatcherFrom('Id');
  protected issueStringify: TuiStringHandler<IssueFullDTO> =
    this.stringifyFrom('Name');
  protected issueMatcher: TuiIdentityMatcher<IssueFullDTO> =
    this.idMatcherFrom('Id');
  phoneNumberSearch: string = '';
  emailSearch: string = '';
  claimNoSearch: string = '';
  currentUser: IUser | null = null;
  //#endregion
  //#region Constructor
  constructor(
    private formBuilder: FormBuilder,
    private landingPageService: LandingPageService,
    private productService: ProductService,
    private issueService: IssuesService,
    private authService: AuthService,
    private notification: NzNotificationService,
    private modal: NzModalService,
    private sanitizer: DomSanitizer
  ) {
    super();
    const url = '/assets/docs/terms_and_conditions_placeholder.pdf';
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.newWarrantyClaimForm = this.formBuilder.group({
      Id: [0],
      CustomerName: ['', [Validators.required]],
      CustomerEmail: ['', [Validators.required]],
      CustomerPhoneNumber: ['', [Validators.required]],
      CustomerAddress: [''],
      Product: [null, [Validators.required]],
      Issue: [null, [Validators.required]],
      SerialNumber: ['', [Validators.required]],
      HasProtectionObj: [],
      HasAdapterObj: [],
      HasCableObj: [],
      HasBatteryObj: [],
      HasIssueWhenOpenBoxObj: [],
      HasCollisionObj: [],
      OperationEnvironmentObj: [],
      Status: [1],
      Type: [1],
      FileAddress: [''],
      Transporter: [''],
      LadingNumber: [''],
      Note: [''],
      RecipientAddress: [''],
      CreatedDate: [new Date()],
      CreatedBy: [''],
      UpdatedDate: [],
      UpdatedBy: [],
      _dummy: [null],
    });
  }
  //#endregion
  ngOnInit(): void {
    this.currentTab = 0;
    this.currentSection = 1;
    this.prepareGrid();
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.currentUser = res?.data ?? null;
      },
      error: (err) => {
        this.currentUser = null;
      },
    });
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
              warrantyClaim: rowData,
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
        container: '#warranty_claim_grid',
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
  loadProducts() {
    this.productService.getDataProducts().subscribe({
      next: (res) => {
        this.productList = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Load dữ liệu sản phẩm thất bại'
        );
      },
    });
  }
  loadIssues() {
    this.issueService.getIssues(0).subscribe({
      next: (res) => {
        this.issueList = res.data;
      },
      error: (err) => {
        this.notification.error(
          NOTIFICATION_TITLE.error,
          'Load dữ liệu hiện tượng hỏng thất bại'
        );
      },
    });
  }
  viewWarrantyStatusCheck() {
    this.currentSection = 1;
    this.serialValue = '';
  }
  viewTermsAndConditions() {
    this.currentSection = 2;
    this.hasAgreed = false;
  }
  viewNewWarrantyClaimForm() {
    this.currentSection = 3;
    this.newWarrantyClaimForm.reset();
  }
  checkStatusBySerial() {
    if (!this.serialValue) return;
    this.landingPageService.checkStatus(this.serialValue).subscribe({
      next: (result) => {
        this.statusData = result.data;
        this.viewTermsAndConditions();
      },
      error: (err) => {
        this.statusData = null;
        this.showConfirm();
      },
    });
  }
  showConfirm() {
    this.modal.confirm({
      nzTitle: '<i>Thông báo?</i>',
      nzContent: '<b>Sản phẩm này không có trong danh sách bảo hành, bạn có muốn tiếp tục không</b>',
      nzOnOk: () => console.log('OK'),
    });
  }
  private async initCaptcha() {
    if (!this.captchaHolder || this.widgetId !== undefined) {
      this.resetCaptcha();
      return;
    }
    await this.loadScript();
    this.widgetId = grecaptcha.render(this.captchaHolder?.nativeElement, {
      sitekey: '6Ldb8CssAAAAAI-kwsDqcgipSPu6AOffl8j2FaIi',
    });
  }

  private resetCaptcha() {
    if (this.widgetId !== undefined) {
      grecaptcha.reset(this.widgetId);
    }
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

  protected navigateToAdmin(): void {
    this.router.navigate(['/admin']);
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
    const rawData = this.newWarrantyClaimForm.getRawValue();
    const {
      Product,
      Issue,
      HasAdapterObj,
      HasBatteryObj,
      HasCableObj,
      HasCollisionObj,
      HasIssueWhenOpenBoxObj,
      HasProtectionObj,
      OperationEnvironmentObj,
      _dummy,
      ...cleanData
    } = rawData;

    const data = new WarrantyClaim({
      ...cleanData,
      ProductId: rawData.Product.Id,
      IssueId: rawData.Issue.Id,
      HasAdapter: rawData.HasAdapterObj?.Value,
      HasBattery: rawData.HasBatteryObj?.Value,
      HasCable: rawData.HasCableObj?.Value,
      HasCollision: rawData.HasCollisionObj?.Value,
      HasIssueWhenOpenBox: rawData.HasIssueWhenOpenBoxObj?.Value,
      HasProtection: rawData.HasProtectionObj?.Value,
      OperationEnvironment: rawData.OperationEnvironmentObj?.Value,
    });
    data.Id = 0; // just in case
    const token = grecaptcha.getResponse(this.widgetId);
    if (token) {
      this.landingPageService.createWarrantyClaim(data).subscribe({
        next: () => {
          this.notification.success(
            NOTIFICATION_TITLE.success,
            'Đăng ký thành công'
          );
          this.newWarrantyClaimForm.reset();
          this.resetCaptcha();
        },
        error: (error: APIResponse<WarrantyClaim> | any) => {
          this.notification.error(
            NOTIFICATION_TITLE.error,
            'Đăng ký thất bại: ' + error?.error?.message || error?.message
          );
        },
      });
    } else {
      this.notification.warning(
        NOTIFICATION_TITLE.warning,
        'Vui lòng nhập captcha hợp lệ'
      );
    }
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
  private stringifyFrom<T, K extends keyof T>(
    searchValue: K
  ): TuiStringHandler<T> {
    return (value: T) => String(value[searchValue] ?? '');
  }

  private idMatcherFrom<T, K extends keyof T>(
    searchValue: K
  ): TuiIdentityMatcher<T> {
    return (value1: T, value2: T) => {
      return value1[searchValue] === value2[searchValue];
    };
  }
}
