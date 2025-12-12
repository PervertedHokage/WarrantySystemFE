import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { routes } from './app.routes';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { icons } from './icons-provider';
import { AuthInterceptor } from './auth/auth.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideEventPlugins(),
    provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(en_US),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    importProvidersFrom(AngularSlickgridModule.forRoot()),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'vi',
      })
    ),
  ],
};
export const APP_LOGIN_NAME = 'admin';
export const EMPLOYEE_ID = 0;
export const ISADMIN = true;
export const USER_NAME = 'ADMINSW';
export const HOST = 'https://localhost:7187/';
// export const HOST = 'http://10.20.29.65:8088/rerpapi/';
// export const HOST = 'http://192.168.1.2:8088/api/';
export const LOGIN_NAME = 'ADMINSW';
export const SERVER_PATH = 'D:/LeTheAnh/RTC/UPLOADFILE/TrainingRegistration/';
export const NOTIFICATION_TITLE = {
  error: 'Lỗi',
  success: 'Thông báo',
  warning: 'Thông báo',
};
