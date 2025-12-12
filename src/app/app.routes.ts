import { Routes } from '@angular/router';
import {AuthGuard} from '../app/auth/auth.guard'
export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => {
      const c = await import(
        './components/landing-page/landing-page.component'
      );
      return c.LandingPageComponent;
    },
  },
  {
    path: 'login',
    loadComponent: async () => {
      const c = await import('./components/login/login.component');
      return c.LoginComponent;
    },
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadComponent: async () => {
      const c = await import('./components/admin/admin.component');
      return c.AdminComponent;
    },
  },
  {
    path: 'admin/organization',
    loadComponent: async () => {
      const c = await import('./components/admin/pages/organization/organization.component');
      return c.OrganizationComponent;
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/_shared/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
