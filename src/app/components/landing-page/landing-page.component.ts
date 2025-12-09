import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
import { TuiFade, TuiSwitch, TuiTabs } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.less'],
  imports: [
    FormsModule,
    KeyValuePipe,
    NgTemplateOutlet,
    RouterLink,
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiFade,
    TuiIcon,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class LandingPageComponent extends TuiPortals {
  private router = inject(Router);
  
  isMainView = true;
  protected expanded = false;
  protected open = false;
  protected switch = false;
  protected readonly routes: any = {};

  protected readonly drawer = {
    Components: [{ name: 'Thu gọn', icon: '@tui.chevron-left' }],
    Essentials: [
      { name: 'Đăng ký bảo hành', icon: '@tui.newspaper' },
      { name: 'Lịch sử bảo hành', icon: '@tui.history' },
      { name: 'Liên hệ', icon: '@tui.contact' },
    ],
  };

  protected handleToggle(): void {
    this.expanded = !this.expanded;
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
