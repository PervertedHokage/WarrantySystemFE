import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Params, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzDestroyService } from 'ng-zorro-antd/core/services';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NgComponentOutlet } from '@angular/common';
import { Type, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
  GroupItem,
  LeafItem,
  MenuItem,
  MenuService,
} from './menu-service/menu.service';
import { MenuEventService } from './menu-service/menu-event.service';
import { AppUserDropdownComponent } from './app-user/app-user-dropdown.component';
import {
  AppNotifycationDropdownComponent,
  NotifyItem,
} from './app-notifycation-dropdown/app-notifycation-dropdown.component';
import { NzGridModule } from 'ng-zorro-antd/grid';

type TabItem = {
  title: string;
  comp: Type<any>;
  injector?: Injector;
  data?: any; // Lưu data để so sánh unique key
};

export const isLeaf = (m: MenuItem): m is LeafItem => m.kind === 'leaf';
export const isGroup = (m: MenuItem): m is GroupItem => m.kind === 'group';

@Component({
  selector: 'app-admin',
  imports: [
    RouterLink,
    NzBadgeModule,
    // RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzTabsModule,
    NzDropDownModule,
    ReactiveFormsModule,
    CommonModule,
    AppNotifycationDropdownComponent,
    AppUserDropdownComponent,
    NgComponentOutlet,
    NzGridModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.less',
  standalone: true,
})
export class AdminComponent implements OnInit, AfterViewInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    public menuService: MenuService,
    private notification: NzNotificationService,
    private injector: Injector,
    private menuEventService: MenuEventService,
    private cdr: ChangeDetectorRef,
  ) {
    this.menus = this.menuService.getMenus();
  }
  notificationComponent = AppNotifycationDropdownComponent;
  //#region Khai báo biến
  isCollapsed = true;
  isMobile = window.innerHeight <= 768;
  isDatcom = false;
  selectedIndex = 0;
  trackKey = (_: number, x: any) => x?.key ?? x?.title ?? _;
  isGroup = (m: MenuItem): m is GroupItem => m.kind === 'group';
  isLeaf = (m: MenuItem): m is LeafItem => m.kind === 'leaf';
  menus: MenuItem[] = [];
  dynamicTabs: TabItem[] = [];

  menu: any = {};
  //#endregion
  notifItems: NotifyItem[] = [];

  menuKey: string = '';
  ngOnInit(): void {
    this.menuService.menuKey$.subscribe((x) => {
      this.menuKey = x;
    });
    this.setOpenMenu(this.menuKey);

    // Subscribe vào event mở tab từ các component con
    this.menuEventService.onOpenTab$.subscribe((tabData) => {
      this.newTab(tabData.comp, tabData.title, tabData.data);
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  newTab(comp: Type<any>, title: string, data?: any) {
    if (this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
    }

    const idx = this.dynamicTabs.findIndex((t) => t.title === title);
    if (idx >= 0) {
      this.selectedIndex = idx;
      return;
    }

    const injector = Injector.create({
      providers: [{ provide: 'tabData', useValue: data }],
      parent: this.injector,
    });

    this.dynamicTabs = [...this.dynamicTabs, { title, comp, injector }];
    setTimeout(() => (this.selectedIndex = this.dynamicTabs.length - 1));
  }

  closeTab({ index }: { index: number }) {
    this.dynamicTabs.splice(index, 1);
    if (this.selectedIndex >= this.dynamicTabs.length)
      this.selectedIndex = this.dynamicTabs.length - 1;
  }

  logout() {
    this.auth.logout();
  }
  onPick(n: NotifyItem) {
    console.log('picked:', n);
    // TODO: điều hướng/đánh dấu đã đọc...
  }

  private setOpenMenu(key: string | null) {
    // Chỉ set isOpen cho group items, không set cho leaf items
    this.menus.forEach((m) => {
      if (this.isGroup(m)) {
        m.isOpen = key !== null && m.key === key;
      }
    });
    // localStorage.setItem('openMenuKey', key ?? '');
  }

  isMenuOpen = (key: string) =>
    this.menus.some((m) => m.key === key && m.isOpen);
  toggleMenu(key: string) {
    // this.menus.forEach((x) => (x.isOpen = false));
    const m = this.menus.find((x) => x.key === key);
    if (m) m.isOpen = !m.isOpen;

    if (m?.isOpen) this.menuKey = key;
  }

  // dùng khi muốn mở thẳng 1 group từ nơi khác
  openOnly(key: string) {
    this.setOpenMenu(key);
  }
}
