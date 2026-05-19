import { BASE_URL } from '../../../runtime';
import {  Injectable, Type , Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { PermissionService } from '../../../services/permission.service';

import { AppUserService } from '../../../services/app-user.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NOTIFICATION_TITLE } from '../../../app.config';

// IMPORT FORM
import { ProductsComponent } from '../pages/products/products.component';
import { IssuesComponent } from '../pages/issues/issues.component';

import { OrganizationComponent } from '../pages/organization/organization.component';
import { WarrantyManagementComponent } from '../pages/warranty-management/warranty-management.component';
import { SalesOrderComponent } from '../pages/sales-order/sales-order.component';
import { QuotationComponent } from '../pages/quotation/quotation.component';
import { UnitComponent } from '../pages/unit/unit.component';
import { WorkOrderComponent } from '../pages/work-order/work-order.component';
import { SerialComponent } from '../pages/serial/serial.component';
import { RegisterComponent } from '../pages/register/register.component';
import { CustomerComponent } from '../pages/customer/customer.component';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = this.baseUrl + 'api/menu/';
  //   private apiUrl = HOST + 'api/menu/';
  constructor(private http: HttpClient,
    private permissionService: PermissionService,
    private appUserService: AppUserService,
    private notification: NzNotificationService,, @Inject(BASE_URL) private baseUrl: string) {}

  private menuKeySource = new BehaviorSubject<string>('');
  menuKey$ = this.menuKeySource.asObservable();

  departmentTechs: any[] = [2, 11, 12, 13];
  departmentAgvCokhis = [9, 10];
  departmentLapraps = [23];
  departmentSales = [3, 12];
  departmentHRs = [6, 22];
  employeeHRs = [586];

  positinLXs = [6]; //List chức vụ NV lái xe
  positinCPs = [7, 72]; //List chức vụ NV cắt phim
  marketings = [8];

  userAllReportTechs = [
    1, 23, 24, 78, 88, 1221, 1313, 1434, 1431, 53, 51, 1534,
  ];

  getMenus(): MenuItem[] {
    let id = this.appUserService.currentUser?.Id || 0;
    let employeeID = this.appUserService.currentUser?.EmployeeID || 0;
    let departmentID = this.appUserService.currentUser?.DepartmentId || 0;
    let positionID = this.appUserService.currentUser?.PositionID || 0;
    let isHR =
      this.employeeHRs.includes(employeeID) ||
      this.departmentHRs.includes(departmentID);

    const isAdmin =
      this.appUserService.currentUser?.IsAdmin &&
      this.appUserService.currentUser?.EmployeeID <= 0;
    const menus: MenuItem[] = [
      //#region menu CRM
      {
        kind: 'group',
        key: 'crm',
        stt: 1,
        title: 'Organization',
        isOpen: true,
        isPermission: true,
        icon: 'assets/icon/menu_crm.svg',
        children: [
          {
            kind: 'leaf',
            key: 'RegisterComponent',
            title: 'User ',
            isOpen: true,
            isPermission: true,
            comp: RegisterComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
        ],
      },
      {
        kind: 'group',
        key: 'management',
        stt: 2,
        title: 'Nghiệp vụ',
        isOpen: false,
        isPermission: true,
        icon: 'assets/icon/hr_asset_management_24.svg',
        children: [
          {
            kind: 'leaf',
            key: 'WarrantyManagementComponent',
            title: 'Quản lý yêu cầu bảo hành',
            isOpen: true,
            isPermission: true,
            comp: WarrantyManagementComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'QuotationComponent',
            title: 'Báo giá',
            isOpen: true,
            isPermission: true,
            comp: QuotationComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'WorkOrderComponent',
            title: 'Work Order ',
            isOpen: true,
            isPermission: true,
            comp: WorkOrderComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'SalesOrderComponent',
            title: 'Đơn hàng ',
            isOpen: true,
            isPermission: true,
            comp: SalesOrderComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
        ],
      },
      {
        kind: 'group',
        key: 'masterdata',
        stt: 3,
        title: 'Master Data',
        isOpen: true,
        isPermission: true,
        icon: 'assets/icon/menu_categories_24.png',
        children: [
          {
            kind: 'leaf',
            key: 'ProductsComponent',
            title: 'Sản phẩm',
            isOpen: true,
            isPermission: true,
            comp: ProductsComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'IssuesComponent',
            title: 'Hiện tượng hỏng ',
            isOpen: true,
            isPermission: true,
            comp: IssuesComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'UnitComponent',
            title: 'Đơn vị ',
            isOpen: true,
            isPermission: true,
            comp: UnitComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
          {
            kind: 'leaf',
            key: 'CustomerComponent',
            title: 'Khách hàng',
            isOpen: true,
            isPermission: true,
            comp: CustomerComponent,
            // icon: 'assets/icon/menu_crm.svg',
          },
        ],
      },
    ];

    return menus;
  }

  goToOldLink(router: string, param: any) {
    let data: any = {
      UserName: this.appUserService.loginName,
      Password: this.appUserService.password,
      Router: router,
    };
    // console.log('window.location:', window.location);

    let params = new URLSearchParams(param).toString();

    let urlTo = `http://localhost:19028${router}`;
    if (params) urlTo = `${urlTo}?${params}`;
    let urlLogin = 'http://localhost:19028/Home/LoginNew';

    const urlOld = 'http://113.190.234.64:8081';
    if (window.location.hostname != 'localhost') {
      urlTo =
        window.location.origin.replace(window.location.port, '8081') + router;
      urlLogin =
        window.location.origin.replace(window.location.port, '8081') +
        '/Home/LoginNew';
    }

    // console.log('url redirect to:', urlTo);
    // console.log('url login:', urlLogin);

    return this.http
      .post<any>(urlLogin, data, { withCredentials: true })
      .subscribe({
        next: (response) => {
          window.open(urlTo, '_blank');
        },
        error: (err) => {
          // console.log('err:', err);
          this.notification.error(NOTIFICATION_TITLE.error, err.message);
        },
      });
  }

  setMenuKey(value: string) {
    this.menuKeySource.next(value);
  }
}

type BaseItem = {
  key: string;
  stt?: number;
  title: string;
  isOpen: boolean;
  icon?: string | ''; // tùy chọn
  isPermission: boolean;
  data?: {};
  router?: string | '';
};

export type LeafItem = BaseItem & {
  kind: 'leaf';
  comp: Type<any>;
};

export type GroupItem = BaseItem & {
  kind: 'group';
  children: MenuItem[];
};
export type MenuItem = LeafItem | GroupItem;
// export
